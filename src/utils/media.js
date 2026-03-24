const VIDEO_URL_PATTERN = /\.(mp4|mov|m4v|avi|webm|mkv|3gp)(\?.*)?$/i;

export const isVideoMimeType = (mimeType) =>
  typeof mimeType === 'string' && mimeType.startsWith('video/');

export const isVideoUrl = (url) =>
  typeof url === 'string' && VIDEO_URL_PATTERN.test(url);

export const isVideoAsset = (asset) =>
  isVideoMimeType(asset?.type) || isVideoUrl(asset?.uri) || isVideoUrl(asset?.fileName);

export const getMediaLabel = (asset) => (isVideoAsset(asset) ? '视频' : '图片');
