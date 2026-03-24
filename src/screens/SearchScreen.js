import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Mock search results
      const results = generateMockResults(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const generateMockResults = (query) => {
    const tags = ['travel', 'food', 'nature', 'city', 'art', 'fashion', 'music'];
    const users = [
      { id: 1, username: 'traveler_john', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 2, username: 'foodie_amy', avatar: 'https://i.pravatar.cc/150?img=8' },
      { id: 3, username: 'nature_lover', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 4, username: 'city_explorer', avatar: 'https://i.pravatar.cc/150?img=20' },
    ];
    
    const results = [];
    
    // Add tags
    tags
      .filter(tag => tag.includes(query.toLowerCase()))
      .forEach(tag => {
        results.push({
          id: `tag_${tag}`,
          type: 'tag',
          title: `#${tag}`,
          subtitle: `${Math.floor(Math.random() * 1000)} posts`,
        });
      });
    
    // Add users
    users
      .filter(user => user.username.includes(query.toLowerCase()))
      .forEach(user => {
        results.push({
          id: `user_${user.id}`,
          type: 'user',
          title: `@${user.username}`,
          subtitle: 'User',
          avatar: user.avatar,
        });
      });
    
    return results;
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      {item.type === 'user' ? (
        <>
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.tagIcon}>
             <Icon name="pricetag-outline" size={24} color="#6C8EBF" />
          </View>
          <View style={styles.tagInfo}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          </View>
        </>
      )}
      <Icon name="chevron-forward" size={20} color="#ADB5BD" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#6C757D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, users, or tags..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="sentences"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={20} color="#ADB5BD" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Results */}
      {searchQuery ? (
        <FlatList
          data={searchResults}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-outline" size={60} color="#DEE2E6" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try different keywords</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Icon name="search-outline" size={80} color="#E9ECEF" />
          <Text style={styles.placeholderText}>Search for posts, users, or tags</Text>
          <Text style={styles.placeholderSubtext}>
            Discover amazing content and connect with others
          </Text>
          
          <View style={styles.trendingContainer}>
            <Text style={styles.trendingTitle}>Trending Now</Text>
            <View style={styles.trendingTags}>
              {['travel', 'food', 'nature', 'art'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.trendingTag}
                  onPress={() => handleSearch(tag)}
                >
                  <Text style={styles.trendingTagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  resultsList: {
    paddingHorizontal: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  tagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
     backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    marginBottom: 40,
  },
  trendingContainer: {
    width: '100%',
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trendingTag: {
     backgroundColor: '#E8F0FE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  trendingTagText: {
     color: '#6C8EBF',
    fontWeight: '600',
  },
});

export default SearchScreen;
