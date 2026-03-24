import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens (to be implemented)
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E9ECEF',
    primary: '#6C8EBF',
    text: '#212529',
  },
};

const getTabIconName = (routeName, focused) => {
  if (routeName === 'Home') {
    return focused ? 'home' : 'home-outline';
  }

  if (routeName === 'Search') {
    return focused ? 'search' : 'search-outline';
  }

  if (routeName === 'Create') {
    return focused ? 'add-circle' : 'add-circle-outline';
  }

  return focused ? 'person' : 'person-outline';
};

const homeTabScreenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => (
    <Icon name={getTabIconName(route.name, focused)} size={size} color={color} />
  ),
  tabBarActiveTintColor: '#6C8EBF',
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E9ECEF',
  },
  sceneStyle: {
    backgroundColor: '#F8F9FA',
  },
  headerShown: false,
});

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={homeTabScreenOptions}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: '首页' }}
      />
       {/* Search tab temporarily removed per user request
       <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ tabBarLabel: '搜索' }}
      /> */}
      <Tab.Screen 
        name="Create" 
        component={CreatePostScreen} 
        options={{ tabBarLabel: '发布' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="HomeTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#212529',
          headerTitleStyle: {
            color: '#212529',
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#F8F9FA',
          },
        }}
      >
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{ 
            title: '帖子详情',
            headerBackTitle: '返回',
            headerBackTitleVisible: true
          }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            title: '登录',
            headerBackTitle: '返回',
            headerBackTitleVisible: true
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ 
            title: '注册',
            headerBackTitle: '返回',
            headerBackTitleVisible: true
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            title: '编辑资料',
            headerBackTitle: '返回',
            headerBackTitleVisible: true
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
