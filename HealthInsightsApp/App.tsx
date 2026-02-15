/**
 * BloomAi – React Native (iOS + Android)
 * Health data, period tracking, chat, food diary.
 */

import React from 'react';
import { StatusBar, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { FoodDiaryScreen } from './src/screens/FoodDiaryScreen';
import { PeriodScreen } from './src/screens/PeriodScreen';

const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 26;
const tabIcons = {
  home: require('./assets/icons/home.png'),
  agents: require('./assets/icons/agents.png'),
  dish: require('./assets/icons/dish.png'),
};

function TabBarImageIcon({ source, tintColor }: { source: ImageSourcePropType; tintColor: string }) {
  return (
    <Image
      source={source}
      style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE, opacity: tintColor === '#292524' ? 1 : 0.5 }}
      resizeMode="contain"
    />
  );
}

function App() {
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
              tabBarIcon: ({ color }) => <TabBarImageIcon source={tabIcons.home} tintColor={color} />,
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              title: 'Wellness Chat',
              tabBarLabel: 'Chat',
              tabBarIcon: ({ color }) => <TabBarImageIcon source={tabIcons.agents} tintColor={color} />,
            }}
          />
          <Tab.Screen
            name="FoodDiary"
            component={FoodDiaryScreen}
            options={{
              title: 'Food Diary',
              tabBarLabel: 'Food',
              tabBarIcon: ({ color }) => <TabBarImageIcon source={tabIcons.dish} tintColor={color} />,
            }}
          />
          <Tab.Screen
            name="Period"
            component={PeriodScreen}
            options={{
              title: 'Period',
              tabBarLabel: 'Period',
              tabBarIcon: ({ color }) => (
                <Ionicons
                  name="water-outline"
                  size={TAB_ICON_SIZE}
                  color={color}
                  style={{ opacity: color === '#292524' ? 1 : 0.5 }}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
