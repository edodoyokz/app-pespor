// App shell: CMS-driven theme + bottom tabs from app_layout.
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from './store';
import { HomeScreen } from './screens/HomeScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { MapScreen } from './screens/MapScreen';
import { LineupScreen } from './screens/LineupScreen';
import { NewsScreen } from './screens/NewsScreen';
import { StampScreen } from './screens/StampScreen';

const Tab = createBottomTabNavigator();

// screen alias → component (mirrors transition_screen_table contract)
const SCREENS: Record<string, React.ComponentType> = {
  home: HomeScreen,
  timetable: TimetableScreen,
  map: MapScreen,
  lineup: LineupScreen,
  news: NewsScreen,
  stamp: StampScreen,
};

export default function App() {
  const { bootstrap, cache, festival, syncing } = useStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!festival) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
        <ActivityIndicator />
        <Text style={{ color: '#fff', marginTop: 12 }}>Loading festival…</Text>
      </View>
    );
  }

  const layout = cache.layout;
  const primary = layout?.primary_color ?? '#e64219';

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#111', card: '#1a1a1a', text: '#fff', primary },
  };

  // CMS tabs; fall back to default set when layout absent.
  const tabs =
    layout?.tabs && layout.tabs.length > 0
      ? layout.tabs
      : [
          { name: 'Home', screen: 'home', ordering: 1 },
          { name: 'TimeTable', screen: 'timetable', ordering: 2 },
          { name: 'Map', screen: 'map', ordering: 3 },
          { name: 'Lineup', screen: 'lineup', ordering: 4 },
          { name: 'News', screen: 'news', ordering: 5 },
        ];

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={layout?.status_bar_color ?? '#000'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: primary },
            headerTintColor: layout?.title_color ?? '#fff',
            tabBarActiveTintColor: primary,
            tabBarInactiveTintColor: '#888',
          }}
        >
          {tabs
            .slice()
            .sort((a, b) => a.ordering - b.ordering)
            .map((tab) => {
              const Cmp = SCREENS[tab.screen];
              return Cmp ? (
                <Tab.Screen key={tab.screen} name={tab.name} component={Cmp} />
              ) : null;
            })}
        </Tab.Navigator>
      </NavigationContainer>
      {syncing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }}>
          <ActivityIndicator size="small" color={primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}
