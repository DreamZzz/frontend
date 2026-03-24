import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, uploadAPI } from '../services/api';
import { buildImageUrl } from '../utils/imageUrl';
import { isVideoUrl } from '../utils/media';
import VideoThumbnail from '../components/VideoThumbnail';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!authUser || !authUser.id) {
      setError('未登录');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.getProfile(authUser.id);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('加载资料失败');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const fetchUserPosts = useCallback(async () => {
    if (!authUser || !authUser.id) {
      setUserPosts([]);
      return;
    }

    try {
      setLoadingPosts(true);
      const response = await postAPI.getUserPosts(authUser.id);
      setUserPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [authUser]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchUserPosts();
    }, [fetchUserPosts, fetchUserProfile])
  );

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { user });
  };

  const handleAvatarUpload = async () => {
    if (!authUser?.id) {
      Alert.alert('错误', '请先登录');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      // 图片选择配置 - 针对头像优化
      const options = {
        mediaType: 'photo',
        maxWidth: 500,      // 头像不需要太大
        maxHeight: 500,
        quality: 0.9,       // 头像质量稍高
        selectionLimit: 1,  // 只能选择一张
      };

      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('用户取消选择');
        return;
      }
      
      if (result.errorCode) {
        console.error('图片选择错误:', result.errorMessage);
        Alert.alert('错误', '选择图片失败');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // 创建文件对象用于上传
        const file = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
        };

        // 上传到OSS
        console.log('开始上传头像...');
        const uploadResponse = await uploadAPI.uploadSingle(file);
        
        if (!uploadResponse.data?.fileUrl) {
          throw new Error('上传返回的文件URL为空');
        }

        const avatarUrl = uploadResponse.data.fileUrl;
        console.log('头像上传成功:', avatarUrl);

        // 更新用户资料
        const updateData = { avatarUrl };
        const updateResponse = await userAPI.updateProfile(authUser.id, updateData);
        
        // 更新本地状态
        setUser(updateResponse.data);
        await updateUser(updateResponse.data);
        
        Alert.alert('成功', '头像更新成功！');
      }
    } catch (uploadError) {
      console.error('头像上传失败:', uploadError);
      Alert.alert('错误', '头像上传失败，请重试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
         <ActivityIndicator size="large" color="#6C8EBF" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
         <Text style={styles.errorText}>{error || '用户不存在'}</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => navigation.navigate('Login')}
        >
           <Text style={styles.loginButtonText}>登录</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
           <Text style={styles.registerButtonText}>注册</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userStats = {
    postCount: userPosts.length,
    followers: 0,
    following: 0,
  };

  const avatarUri = user.avatarUrl || 'https://i.pravatar.cc/150?img=1';
  const displayName = user.displayName || user.username;
  const profileMeta = [
    user.gender ? `性别 ${user.gender}` : null,
    user.birthday ? `生日 ${user.birthday}` : null,
    user.region ? `地区 ${user.region}` : null,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity 
           onPress={handleAvatarUpload}
           disabled={uploadingAvatar}
           style={styles.avatarContainer}
         >
           <Image source={{ uri: buildImageUrl(avatarUri) || avatarUri }} style={styles.avatar} />
           {uploadingAvatar && (
             <View style={styles.avatarOverlay}>
               <ActivityIndicator size="small" color="white" />
             </View>
           )}
           <View style={styles.avatarEditIcon}>
             <Icon name="camera" size={16} color="white" />
           </View>
         </TouchableOpacity>
         <Text style={styles.displayName}>{displayName}</Text>
         <Text style={styles.username}>@{user.username}</Text>
         <Text style={styles.email}>{user.email}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.postCount}</Text>
             <Text style={styles.statLabel}>帖子</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.followers}</Text>
             <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.following}</Text>
             <Text style={styles.statLabel}>关注</Text>
          </View>
        </View>
        
         <Text style={styles.bio}>{user.bio || '暂无简介'}</Text>
         {profileMeta.length > 0 && (
           <View style={styles.metaContainer}>
             {profileMeta.map((item) => (
               <Text key={item} style={styles.metaText}>{item}</Text>
             ))}
           </View>
         )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
         <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Icon name="create-outline" size={20} color="#6C8EBF" />
            <Text style={styles.actionText}>编辑资料</Text>
         </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
           <Icon name="log-out-outline" size={20} color="#D99A9A" />
           <Text style={[styles.actionText, styles.logoutText]}>退出登录</Text>
        </TouchableOpacity>
      </View>

      {/* User's posts grid */}
      <View style={styles.postsContainer}>
          <Text style={styles.postsTitle}>我的帖子 ({userPosts.length})</Text>
        {loadingPosts ? (
          <View style={styles.postsLoading}>
            <ActivityIndicator size="small" color="#6C8EBF" />
          </View>
        ) : userPosts.length > 0 ? (
          <View style={styles.postsGrid}>
            {userPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postThumbnail}
                onPress={() => navigation.navigate('Detail', { postId: post.id })}
              >
                {post.imageUrls && post.imageUrls.length > 0 ? (
                  isVideoUrl(post.imageUrls[0]) ? (
                    <VideoThumbnail
                      url={post.imageUrls[0]}
                      style={styles.videoThumbnail}
                      imageStyle={styles.thumbnailImage}
                      badgePosition="topRight"
                      badgeSize={24}
                    />
                  ) : (
                    <Image
                      source={{ uri: buildImageUrl(post.imageUrls[0]) }}
                      style={styles.thumbnailImage}
                    />
                  )
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Icon name="image-outline" size={24} color="#6C757D" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noPostsContainer}>
            <Icon name="camera-outline" size={40} color="#ADB5BD" />
            <Text style={styles.noPostsText}>暂无帖子</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
     borderColor: '#6C8EBF',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C8EBF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  username: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 5,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  metaContainer: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6C757D',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
     color: '#6C8EBF',
  },
  logoutText: {
     color: '#D99A9A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
     backgroundColor: '#6C8EBF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
     backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C8EBF',
  },
  registerButtonText: {
    color: '#6C8EBF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsContainer: {
    backgroundColor: 'white',
    padding: 15,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postThumbnail: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: '2%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  postsLoading: {
    alignItems: 'center',
    padding: 20,
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noPostsText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6C757D',
  },
});

export default ProfileScreen;
