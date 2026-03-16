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
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/api';

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      
      // Store token (in real app, use AsyncStorage or secure store)
      const token = response.data.token;
      console.log('Login successful, token:', token);
      
      // Navigate to home
      navigation.navigate('HomeTabs');
    } catch (error) {
      console.error('Login error:', error);
       Alert.alert('登录失败', '用户名或密码错误');
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
