import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { uploadAPI, postAPI } from '../services/api';
import { getMediaLabel, isVideoAsset } from '../utils/media';
import VideoThumbnail from '../components/VideoThumbnail';

const CreatePostScreen = ({ navigation }) => {
  const { user } = useAuth();
   const [mediaFiles, setMediaFiles] = useState([]);
   const [loading, setLoading] = useState(false);
   const contentInputRef = useRef(null);
   const contentDraftRef = useRef('');
   const isIosSimulator = useMemo(
     () => Platform.OS === 'ios' && String(Platform.constants?.model || '').includes('Simulator'),
     []
   );

   useFocusEffect(
     useCallback(() => {
       return () => {
         contentDraftRef.current = '';
         setMediaFiles([]);
         setLoading(false);
       };
     }, [])
   );

   const mapAssetToMediaFile = (asset) => {
     const isVideo = isVideoAsset(asset);
     const fallbackExtension = isVideo ? 'mp4' : 'jpg';

     return {
       uri: asset.uri,
       fileName: asset.fileName || `media_${Date.now()}.${fallbackExtension}`,
       type: asset.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
       isVideo,
     };
   };

   const normalizePickedAssets = (assets, remainingSlots) => {
     const nextAssets = assets.map(mapAssetToMediaFile);
     const videoAssets = nextAssets.filter((asset) => asset.isVideo);
     const imageAssets = nextAssets.filter((asset) => !asset.isVideo);

     if (videoAssets.length > 0) {
       if (videoAssets.length > 1 || imageAssets.length > 0) {
         Alert.alert('提示', '一次只能选择一个视频，已保留第一个视频。');
       }
       return [videoAssets[0]];
     }

     return imageAssets.slice(0, remainingSlots);
   };

   const openMediaPicker = async ({ source, mediaType }) => {
    try {
      const remainingSlots = 10 - mediaFiles.length;
      if (remainingSlots <= 0) {
        Alert.alert('提示', '最多只能上传10个媒体文件');
        return;
      }

      const options = {
        mediaType,
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
        videoQuality: 'medium',
        durationLimit: mediaType !== 'photo' ? 30 : undefined,
        selectionLimit: source === 'camera' ? 1 : remainingSlots,
        formatAsMp4: Platform.OS === 'ios' && mediaType !== 'photo',
      };

      const result = source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('User cancelled media picker');
      } else if (result.errorCode) {
        console.log('MediaPicker Error: ', result.errorMessage);
        if (result.errorCode === 'camera_unavailable') {
          Alert.alert('无法使用摄像头', '当前环境不支持摄像头拍摄。iOS 模拟器不支持拍照/拍视频，请使用真机验证，或先从相册选择。');
        } else if (result.errorCode === 'permission') {
          Alert.alert('权限不足', '请在系统设置中允许访问摄像头、照片和麦克风。');
        } else {
          Alert.alert('错误', `选择媒体失败：${result.errorMessage || result.errorCode}`);
        }
      } else if (result.assets && result.assets.length > 0) {
        const newMedia = normalizePickedAssets(result.assets, remainingSlots);
        setMediaFiles(prev => [...prev, ...newMedia].slice(0, 10));
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('错误', '选择媒体时发生错误');
    }
  };

  const openCameraPicker = () => {
    if (Platform.OS === 'android') {
      Alert.alert('相机', '选择拍摄方式', [
        { text: '拍照', onPress: () => openMediaPicker({ source: 'camera', mediaType: 'photo' }) },
        { text: '拍视频', onPress: () => openMediaPicker({ source: 'camera', mediaType: 'video' }) },
        { text: '取消', style: 'cancel' },
      ]);
      return;
    }

    openMediaPicker({ source: 'camera', mediaType: 'mixed' });
  };

  const openLibraryPicker = () => {
    openMediaPicker({ source: 'library', mediaType: 'mixed' });
  };

  const handleAddMedia = () => {
    const actions = [];
    if (!isIosSimulator) {
      actions.push({ text: '相机', onPress: openCameraPicker });
    }

    actions.push(
      { text: '从相册选择', onPress: openLibraryPicker },
      { text: '取消', style: 'cancel' }
    );

    Alert.alert('添加媒体', '选择媒体来源', actions);
  };

  const removeMedia = (index) => {
    const nextMedia = [...mediaFiles];
    nextMedia.splice(index, 1);
    setMediaFiles(nextMedia);
  };

  const handlePost = async () => {
    const content = contentDraftRef.current.trim();

    if (!content && mediaFiles.length === 0) {
      Alert.alert('错误', '请添加内容、图片或视频');
      return;
    }

    if (!user?.id) {
      Alert.alert('错误', '请登录后发布帖子');
      navigation.navigate('Login');
      return;
    }

    setLoading(true);
    try {
      const mediaUrls = [];
      for (const media of mediaFiles) {
        try {
          const file = {
            uri: media.uri,
            type: media.type,
            name: media.fileName,
          };
          
          const response = await uploadAPI.uploadSingle(file);
           console.log('Image upload response:', response.data);
           if (response.data?.fileUrl) {
             mediaUrls.push(response.data.fileUrl);
             console.log('Added image URL:', response.data.fileUrl);
           } else {
             console.warn('Upload response missing fileUrl:', response.data);
           }
         } catch (uploadError) {
           console.error('Failed to upload image:', uploadError);
           console.error('Upload error details:', uploadError.response?.data || uploadError.message);
           // Continue with other images
         }
      }

       const postData = {
         content,
         imageUrls: mediaUrls,
       };
       
       console.log('Post data to send:', postData);
       console.log('Media URLs:', mediaUrls);

       const response = await postAPI.createPost(postData, user.id);
       console.log('Post creation response:', response.data);
      
       Alert.alert('成功', '帖子发布成功！');
       contentDraftRef.current = '';
       setMediaFiles([]);
       contentInputRef.current?.clear();
       navigation.navigate('Home');
    } catch (error) {
      console.error('Error creating post:', error);
      if (!error.response) {
        Alert.alert('错误', '无法连接到后端服务，请确认后端和数据库已启动');
      } else if (error.response.status === 401) {
        Alert.alert('错误', '登录状态已失效，请重新登录');
        navigation.navigate('Login');
      } else {
        Alert.alert('错误', error.response?.data || '发布失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
         <Text style={styles.title}>发布新帖子</Text>
        
        {/* Content Input */}
        <View style={styles.inputContainer}>
           <TextInput
               ref={contentInputRef}
               style={styles.contentInput}
               placeholder="分享你的想法..."
               defaultValue=""
               onChangeText={(text) => {
                 contentDraftRef.current = text;
               }}
               multiline
               numberOfLines={6}
               textAlignVertical="top"
               autoCorrect={false}
               spellCheck={false}
               autoComplete="off"
               textContentType="none"
               keyboardType="default"
               scrollEnabled
             />
        </View>

        {/* Image Upload */}
        <View style={styles.imageSection}>
           <Text style={styles.sectionTitle}>添加图片或视频</Text>
           <Text style={styles.sectionSubtitle}>
             最多可添加10个媒体文件
           </Text>
           {isIosSimulator && (
             <Text style={styles.simulatorHint}>
               iOS 模拟器不支持摄像头，当前仅展示“从相册选择”。拍摄功能请使用真机验证。
             </Text>
           )}
          
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddMedia}>
             <Icon name="camera-outline" size={30} color="#6C8EBF" />
             <Text style={styles.addImageText}>添加媒体</Text>
          </TouchableOpacity>

          {/* Image Preview */}
          {mediaFiles.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewTitle}>
                 已选媒体 ({mediaFiles.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mediaFiles.map((media, index) => (
                  <View key={index} style={styles.imagePreview}>
                     {media.isVideo ? (
                       <VideoThumbnail
                         url={media.uri}
                         style={styles.videoPreview}
                         imageStyle={styles.previewImage}
                         badgePosition="center"
                         badgeSize={48}
                         label={getMediaLabel(media)}
                       />
                     ) : (
                       <Image source={{ uri: media.uri }} style={styles.previewImage} />
                     )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMedia(index)}
                    >
                       <Icon name="close-circle" size={24} color="#D99A9A" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, loading && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
             {loading ? '发布中...' : '发布帖子'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
  },
  simulatorHint: {
    fontSize: 12,
    color: '#D99A9A',
    marginBottom: 12,
    lineHeight: 18,
  },
  addImageButton: {
    backgroundColor: 'white',
    borderWidth: 2,
     borderColor: '#6C8EBF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addImageText: {
     color: '#6C8EBF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  imagePreviewContainer: {
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  videoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#212529',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    marginTop: 6,
    color: 'white',
    fontSize: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  postButton: {
     backgroundColor: '#6C8EBF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreatePostScreen;
