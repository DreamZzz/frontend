import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
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
    };

    fetchUserProfile();
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
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
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('Home')}>
           <Text style={styles.retryButtonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userStats = {
    postCount: 0,
    followers: 0,
    following: 0,
  };

  const avatarUri = user.avatarUrl || 'https://i.pravatar.cc/150?img=1';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
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
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
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

      {/* Placeholder for user's posts grid */}
      <View style={styles.postsContainer}>
         <Text style={styles.postsTitle}>我的帖子</Text>
        <View style={styles.postsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.postThumbnail}>
              <Image
                source={{ uri: `https://picsum.photos/200/200?random=${item}` }}
                style={styles.thumbnailImage}
              />
            </View>
          ))}
        </View>
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
     borderColor: '#6C8EBF',
  },
  username: {
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
  retryButton: {
     backgroundColor: '#6C8EBF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
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
});

export default ProfileScreen;
