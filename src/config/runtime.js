import { Platform } from 'react-native';

const DEFAULT_CONFIG = {
  environment: 'local',
  apiBaseUrl: Platform.OS === 'ios' ? 'http://127.0.0.1:18080' : 'http://10.0.2.2:8080',
  proxyTarget: 'http://127.0.0.1:8080',
};

let generatedConfig = null;

try {
  generatedConfig = require('./runtime.generated').default;
} catch (error) {
  generatedConfig = null;
}

const runtimeConfig = generatedConfig || DEFAULT_CONFIG;

export default runtimeConfig;
