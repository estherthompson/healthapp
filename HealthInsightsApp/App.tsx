/**
 * Health Insights – React Native (iOS + Android)
 * Phase 1: Health data (steps). Phase 2: AI chatbot.
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppDataProvider } from './src/context/AppDataContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function App() {
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarLabelStyle: { fontSize: 12 },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Health Insights', tabBarLabel: 'Home' }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Wellness Chat', tabBarLabel: 'Chat' }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile', tabBarLabel: 'Profile' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

export default App;
