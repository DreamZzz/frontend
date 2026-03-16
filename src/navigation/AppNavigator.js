import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
         tabBarActiveTintColor: '#6C8EBF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeTabs">
        <Stack.Screen 
          name="HomeTabs" 
          component={HomeTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{ title: '帖子详情' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: '登录' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: '注册' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
