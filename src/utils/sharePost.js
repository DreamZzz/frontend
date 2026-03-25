import Share from 'react-native-share';
import runtimeConfig from '../config/runtime';

const buildSharePayload = (post) => {
  const headline = post?.content?.trim() || '分享一条帖子';
  const locationText = post?.locationName ? `\n地点：${post.locationName}` : '';
  const mediaUrl = Array.isArray(post?.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls[0] : '';

  return {
    title: '分享帖子',
    message: `${headline}${locationText}`,
    url: mediaUrl || undefined,
    failOnCancel: false,
  };
};

export const sharePost = async (post, target = 'system') => {
  const payload = buildSharePayload(post);

  if ((target === 'wechat' || target === 'moments') && !runtimeConfig.wechatAppId) {
    throw new Error('当前环境未配置微信开放平台 AppID，暂时只能使用系统分享面板。');
  }

  await Share.open(payload);
};
