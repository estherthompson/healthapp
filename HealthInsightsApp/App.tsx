/**
 * BloomAi – React Native (iOS + Android)
 * Health data, profile, chat, food diary.
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, Image, ImageSourcePropType, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { loadProfileStore } from './src/storage/profileStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { FoodDiaryScreen } from './src/screens/FoodDiaryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 26;
const tabIcons = {
  home: require('./assets/icons/home.png'),
  agents: require('./assets/icons/agents.png'),
  dish: require('./assets/icons/dish.png'),
};

const styles = StyleSheet.create({
  tabIcon: { width: TAB_ICON_SIZE, height: TAB_ICON_SIZE },
  tabIconActive: { opacity: 1 },
  tabIconInactive: { opacity: 0.5 },
});

function TabBarImageIcon({ source, tintColor }: { source: ImageSourcePropType; tintColor: string }) {
  const opacityStyle = tintColor === '#292524' ? styles.tabIconActive : styles.tabIconInactive;
  return (
    <Image
      source={source}
      style={[styles.tabIcon, opacityStyle]}
      resizeMode="contain"
    />
  );
}

function HomeTabIcon({ color }: { color: string }) {
  return <TabBarImageIcon source={tabIcons.home} tintColor={color} />;
}
function ChatTabIcon({ color }: { color: string }) {
  return <TabBarImageIcon source={tabIcons.agents} tintColor={color} />;
}
function FoodTabIcon({ color }: { color: string }) {
  return <TabBarImageIcon source={tabIcons.dish} tintColor={color} />;
}
function ProfileTabIcon({ color }: { color: string }) {
  return (
    <Ionicons
      name="person-circle-outline"
      size={TAB_ICON_SIZE}
      color={color}
      style={color === '#292524' ? styles.tabIconActive : styles.tabIconInactive}
    />
  );
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProfileStore().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fef08a' }}>
          <ActivityIndicator size="large" color="#292524" />
          <Text style={{ marginTop: 12, color: '#292524', fontSize: 14 }}>Loading…</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#fef08a' },
            headerTintColor: '#292524',
            headerTitleStyle: { fontWeight: '600', color: '#292524' },
            tabBarStyle: { backgroundColor: '#ffffff' },
            tabBarActiveTintColor: '#292524',
            tabBarInactiveTintColor: 'rgba(41,37,36,0.5)',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
            tabBarIconStyle: { marginTop: 6 },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Home',
              tabBarIcon: HomeTabIcon,
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              title: 'Wellness Chat',
              tabBarLabel: 'Chat',
              tabBarIcon: ChatTabIcon,
            }}
          />
          <Tab.Screen
            name="FoodDiary"
            component={FoodDiaryScreen}
            options={{
              title: 'Food Diary',
              tabBarLabel: 'Food',
              tabBarIcon: FoodTabIcon,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
              tabBarLabel: 'Profile',
              tabBarIcon: ProfileTabIcon,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
