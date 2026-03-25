import { API_BASE_URL } from '../config/api';

export const getResponseErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message.trim();
  }

  return fallbackMessage;
};

export const getRequestErrorMessage = (
  error,
  fallbackMessage,
  {
    apiBaseUrl = API_BASE_URL,
    includeRequestUrl = false,
    includeErrorCode = false,
    networkFallbackMessage = fallbackMessage,
  } = {}
) => {
  if (error?.response) {
    return getResponseErrorMessage(error, fallbackMessage);
  }

  const lines = [networkFallbackMessage];

  if (includeRequestUrl && apiBaseUrl) {
    lines.push(`请求地址: ${apiBaseUrl}`);
  }

  lines.push(`错误信息: ${error?.message || 'unknown error'}`);

  if (includeErrorCode && error?.code) {
    lines.push(`错误代码: ${error.code}`);
  }

  return lines.join('\n');
};
