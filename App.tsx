/**
 * Social App - iOS Application
 * React Native with Spring Boot Backend
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

function App(): React.JSX.Element {
  useEffect(() => {
    // Load Ionicons font
    Icon.loadFont()
      .then(() => undefined)
      .catch(error => console.error('Error loading Ionicons font:', error));
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ErrorBoundary>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
          <AppNavigator />
        </ErrorBoundary>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
