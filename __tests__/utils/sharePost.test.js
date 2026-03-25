jest.mock('react-native-share', () => ({
  open: jest.fn(async () => undefined),
}));

jest.mock('react-native-wechat-lib', () => ({
  registerApp: jest.fn(async () => true),
  isWXAppInstalled: jest.fn(async () => true),
  shareText: jest.fn(async () => undefined),
  shareImage: jest.fn(async () => undefined),
}));

describe('sharePost', () => {
  const post = {
    content: '三里屯探店',
    username: 'zhao',
    imageUrls: ['https://example.com/post.jpg'],
    locationName: '三里屯太古里',
    locationAddress: '北京市朝阳区三里屯路',
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('always uses the system share sheet for the system target', async () => {
    jest.doMock('../../src/config/runtime', () => ({
      __esModule: true,
      default: {
        wechatAppId: '',
        wechatUniversalLink: '',
      },
    }));

    const Share = jest.requireMock('react-native-share');
    const { sharePost } = require('../../src/utils/sharePost');

    await sharePost(post, 'system');

    expect(Share.open).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '分享帖子',
        message: '三里屯探店\n地点：三里屯太古里',
        url: 'https://example.com/post.jpg',
        failOnCancel: false,
      })
    );
  });

  it('shares to WeChat when the SDK and runtime config are ready', async () => {
    jest.doMock('../../src/config/runtime', () => ({
      __esModule: true,
      default: {
        wechatAppId: 'wx123456',
        wechatUniversalLink: 'https://example.com/wechat/',
      },
    }));

    const WeChat = jest.requireMock('react-native-wechat-lib');
    const { sharePost } = require('../../src/utils/sharePost');

    await sharePost(post, 'wechat');

    expect(WeChat.registerApp).toHaveBeenCalledWith('wx123456', 'https://example.com/wechat/');
    expect(WeChat.isWXAppInstalled).toHaveBeenCalled();
    expect(WeChat.shareImage).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'https://example.com/post.jpg',
        scene: 0,
      })
    );
  });

  it('throws a clear error when WeChat config is missing', async () => {
    jest.doMock('../../src/config/runtime', () => ({
      __esModule: true,
      default: {
        wechatAppId: '',
        wechatUniversalLink: '',
      },
    }));

    const { sharePost } = require('../../src/utils/sharePost');

    await expect(sharePost(post, 'wechat')).rejects.toMatchObject({
      code: 'WECHAT_UNAVAILABLE',
    });
  });
});
