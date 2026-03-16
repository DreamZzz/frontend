import React, { useState } from 'react';
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
import ImagePicker from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { uploadAPI, postAPI } from '../services/api';

const CreatePostScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImagePick = () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        const imageData = {
          uri: response.uri,
          fileName: response.fileName || `image_${Date.now()}.jpg`,
          type: response.type || 'image/jpeg',
        };
        setImages([...images, imageData]);
      }
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('错误', '请添加内容或图片');
      return;
    }

    if (!user?.id) {
      Alert.alert('错误', '请登录后发布帖子');
      navigation.navigate('Login');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = [];
      for (const image of images) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: image.uri,
            type: image.type,
            name: image.fileName,
          });
          
          const response = await uploadAPI.uploadSingle(formData);
          if (response.data?.fileUrl) {
            imageUrls.push(response.data.fileUrl);
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Continue with other images
        }
      }

      const postData = {
        content: content.trim(),
        imageUrls: imageUrls,
      };

      const response = await postAPI.createPost(postData, user.id);
      
      Alert.alert('成功', '帖子发布成功！');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('错误', '发布失败');
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
            style={styles.contentInput}
             placeholder="分享你的想法..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.imageSection}>
           <Text style={styles.sectionTitle}>添加图片</Text>
           <Text style={styles.sectionSubtitle}>
             最多可添加10张图片
           </Text>
          
          <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
             <Icon name="camera-outline" size={30} color="#6C8EBF" />
             <Text style={styles.addImageText}>添加图片</Text>
          </TouchableOpacity>

          {/* Image Preview */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewTitle}>
                 已选图片 ({images.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={image} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
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
