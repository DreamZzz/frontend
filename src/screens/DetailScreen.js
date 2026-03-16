import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');

const DetailScreen = ({ route, navigation }) => {
  const postId = route.params?.postId;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      console.error('No postId provided');
      return;
    }
    fetchPostDetails();
    fetchComments();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(generateMockPost());
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/post/${postId}/all`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments(generateMockComments());
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // In a real app, you would send this to the API
    const mockComment = {
      id: Date.now(),
      content: newComment,
      username: 'current_user',
      userAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      createdAt: new Date().toISOString(),
      likeCount: 0,
    };
    
    setComments([mockComment, ...comments]);
    setNewComment('');
  };

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        likeCount: post.likeCount + 1,
      });
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.centerContainer}>
         <ActivityIndicator size="large" color="#6C8EBF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Author Info */}
      <View style={styles.authorContainer}>
        <Image
          source={{ uri: post.userAvatarUrl || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>@{post.username}</Text>
          <Text style={styles.postTime}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Image Swiper */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <View style={styles.swiperContainer}>
          <Swiper
            style={styles.swiper}
            showsButtons={false}
            showsPagination
            dotColor="rgba(255,255,255,0.5)"
             activeDotColor="#6C8EBF"
          >
            {post.imageUrls.map((url, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={{ uri: url || 'https://via.placeholder.com/400' }}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </Swiper>
        </View>
      )}

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{post.content}</Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={handleLike}>
             <Icon name="heart-outline" size={24} color="#D99A9A" />
            <Text style={styles.statText}>{post.likeCount || 0}</Text>
          </TouchableOpacity>
          
          <View style={styles.statItem}>
             <Icon name="chatbubble-outline" size={24} color="#6C8EBF" />
            <Text style={styles.statText}>{post.commentCount || 0}</Text>
          </View>
          
          <TouchableOpacity style={styles.statItem}>
            <Icon name="share-outline" size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsContainer}>
         <Text style={styles.commentsTitle}>评论 ({comments.length})</Text>
        
        {/* Add Comment */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
             placeholder="添加评论..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
            <Icon name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Image
                source={{ uri: item.userAvatarUrl || 'https://i.pravatar.cc/150' }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>@{item.username}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentAction}>
                    <Icon name="heart-outline" size={14} color="#6C757D" />
                    <Text style={styles.commentActionText}>{item.likeCount || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.commentAction}>
                     <Text style={styles.commentActionText}>回复</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

// Mock data
const generateMockPost = () => ({
  id: 1,
  content: 'Beautiful scenery from my recent trip! The mountains were amazing and the weather was perfect. #travel #nature',
  imageUrls: [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3',
  ],
  username: 'traveler_john',
  userAvatarUrl: 'https://i.pravatar.cc/150?img=12',
  likeCount: 245,
  commentCount: 32,
  createdAt: new Date().toISOString(),
});

const generateMockComments = () => [
  {
    id: 1,
    content: 'This looks absolutely stunning! Where was this taken?',
    username: 'nature_lover',
    userAvatarUrl: 'https://i.pravatar.cc/150?img=8',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likeCount: 12,
  },
  {
    id: 2,
    content: 'The composition is perfect! Great shot!',
    username: 'photo_expert',
    userAvatarUrl: 'https://i.pravatar.cc/150?img=15',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    likeCount: 8,
  },
  {
    id: 3,
    content: 'I was there last month! Such a beautiful place.',
    username: 'wanderlust_amy',
    userAvatarUrl: 'https://i.pravatar.cc/150?img=20',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    likeCount: 5,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#212529',
  },
  postTime: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  swiperContainer: {
    height: width,
    backgroundColor: 'black',
  },
  swiper: {
    height: width,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212529',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  commentsContainer: {
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212529',
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
     backgroundColor: '#6C8EBF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 14,
    color: '#212529',
  },
  commentTime: {
    fontSize: 11,
    color: '#6C757D',
  },
  commentText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  commentActionText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 4,
  },
});

export default DetailScreen;
