import Share from 'react-native-share';
import { sharePostToWechat } from './wechatShare';

const buildSystemSharePayload = (post) => {
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
  if (target === 'system') {
    await Share.open(buildSystemSharePayload(post));
    return;
  }

  if (target === 'wechat' || target === 'moments') {
    await sharePostToWechat(post, target);
    return;
  }

  throw new Error(`未知的分享目标: ${target}`);
};

