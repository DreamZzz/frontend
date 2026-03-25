import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { postAPI } from '../services/api';
import { isVideoUrl } from '../utils/media';
import VideoThumbnail from '../components/VideoThumbnail';
import CachedImage from '../components/CachedImage';

const { width } = Dimensions.get('window');
const itemWidth = (width - 30) / 2; // Two columns with padding

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 0) => {
    try {
      const response = await postAPI.getAllPosts(pageNum, 10);
      if (pageNum === 0) {
        setPosts(response.data.content || []);
      } else {
        setPosts(prev => [...prev, ...(response.data.content || [])]);
      }
      setHasMore(!response.data.last);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // For demo, use mock data if API fails
      if (pageNum === 0) {
        setPosts(generateMockPosts());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchPosts(0);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleOpenSearch = () => {
    navigation.navigate('Search');
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('Detail', { postId: item.id })}
    >
      {item.imageUrls && item.imageUrls.length > 0 && (
        isVideoUrl(item.imageUrls[0]) ? (
          <VideoThumbnail
            url={item.imageUrls[0]}
            style={styles.postImage}
            imageStyle={styles.postImage}
            badgePosition="topRight"
            badgeSize={26}
          />
        ) : (
          <CachedImage
            uri={item.imageUrls[0]}
            style={styles.postImage}
          />
        )
      )}
      <View style={styles.postInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        {!!item.locationName && (
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={13} color="#6C8EBF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.locationName}
            </Text>
          </View>
        )}
         <View style={styles.stats}>
           <View style={styles.statItem}>
             <Icon name="heart-outline" size={14} color="#D99A9A" />
             <Text style={styles.statText}> {item.likeCount || 0}</Text>
           </View>
           <View style={styles.statItem}>
             <Icon name="chatbubble-outline" size={14} color="#6C8EBF" />
             <Text style={styles.statText}> {item.commentCount || 0}</Text>
           </View>
         </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6C8EBF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchEntry} onPress={handleOpenSearch} activeOpacity={0.9}>
        <Icon name="search" size={18} color="#6C757D" />
        <Text style={styles.searchEntryText}>搜索帖子、用户名、地点</Text>
        <Icon name="chevron-forward" size={18} color="#ADB5BD" />
      </TouchableOpacity>

      {loading && posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C8EBF" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

// Mock data for demo
const generateMockPosts = () => {
  const mockPosts = [];
  for (let i = 1; i <= 20; i++) {
    mockPosts.push({
      id: i,
      content: `Beautiful scenery from my recent trip! The mountains were amazing and the weather was perfect. #travel #nature`,
      imageUrls: [`https://picsum.photos/300/300?random=${i}`],
      username: `user${i}`,
      userAvatarUrl: `https://i.pravatar.cc/150?img=${i}`,
      likeCount: Math.floor(Math.random() * 1000),
      commentCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
    });
  }
  return mockPosts;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchEntryText: {
    flex: 1,
    marginHorizontal: 10,
    color: '#6C757D',
    fontSize: 14,
  },
  postItem: {
    width: itemWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: itemWidth,
    backgroundColor: '#E9ECEF',
  },
  postInfo: {
    padding: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#212529',
    marginBottom: 4,
  },
  content: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6C8EBF',
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#ADB5BD',
    marginLeft: 2,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default HomeScreen;
