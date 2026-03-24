import runtimeConfig from './runtime';

const DEFAULT_WEB_BASE_URL = runtimeConfig.apiBaseUrl;

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

const getConfiguredBaseUrl = () => {
  if (typeof process === 'undefined' || !process.env) {
    return DEFAULT_WEB_BASE_URL;
  }

  const candidates = [
    process.env.REACT_NATIVE_API_BASE_URL,
  ];

  const configuredValue = candidates.find(
    (value) => typeof value === 'string' && /^https?:\/\//.test(value.trim())
  );

  return normalizeBaseUrl(configuredValue || DEFAULT_WEB_BASE_URL);
};

export const WEB_BASE_URL = getConfiguredBaseUrl();
export const API_BASE_URL = `${WEB_BASE_URL}/api`;
