import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { API_BASE_URL } from '../config/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      
      const { token, id, username: responseUsername, displayName, email, avatarUrl } = response.data;
      console.log('Login successful, token:', token);
      
      // Create user data object
      const userData = {
        id,
        username: responseUsername,
        displayName,
        email,
        avatarUrl
      };
      
      // Store token and user data using AuthContext
      await login(userData, token);
      
      // Navigate to home
      navigation.navigate('HomeTabs');
    } catch (error) {
      console.error('Login error:', error);
      if (!error.response) {
        const details = __DEV__
          ? `无法连接到后端服务\n请求地址: ${API_BASE_URL}\n错误信息: ${error.message || 'unknown error'}`
          : '无法连接到后端服务，请确认后端和数据库已启动';
        Alert.alert('登录失败', details);
      } else if (error.response.status === 401) {
        Alert.alert('登录失败', '用户名或密码错误');
      } else {
        const message =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || `服务器异常，请稍后重试（${error.response?.status}）`;
        Alert.alert('登录失败', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录您的账户</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入用户名"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
             {loading ? '登录中...' : '登录'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账户？ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>注册</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  button: {
     backgroundColor: '#6C8EBF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#6C757D',
    fontSize: 14,
  },
  footerLink: {
     color: '#6C8EBF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
