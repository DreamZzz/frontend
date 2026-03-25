import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { postAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  postAPI: {
    getAllPosts: jest.fn(),
  },
}));

jest.mock('../../src/components/CachedImage', () => 'CachedImage');
jest.mock('../../src/components/VideoThumbnail', () => 'VideoThumbnail');
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    postAPI.getAllPosts.mockReset();
    postAPI.getAllPosts.mockResolvedValue({
      data: {
        content: [],
        last: true,
      },
    });
  });

  it('navigates to Search when tapping the search entry', async () => {
    const navigation = {
      navigate: jest.fn(),
    };

    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen navigation={navigation} />);
    });

    const searchEntry = renderer.root
      .findAllByType(TouchableOpacity)
      .find((node) =>
        node.props.children?.some?.((child) => child?.props?.children === '搜索帖子、用户名、地点')
      );

    expect(searchEntry).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      searchEntry.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Search');
  });
});
