import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import HomePage from './screens/HomePage';
import PredictPage from './screens/PredictPage';
import ConsultPage from './screens/ConsultPage';
import { Ionicons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const HEADER_META = {
  Home: {
    title: 'Brainic',
    subtitle: 'Overview & quick actions',
  },
  Predict: {
    title: 'MRI Predictor',
    subtitle: 'Upload and classify scan images',
  },
  Consult: {
    title: 'AI Consultation',
    subtitle: 'Ask medical questions instantly',
  },
};

function HeaderTitle({ routeName }) {
  const meta = HEADER_META[routeName] ?? HEADER_META.Home;

  return (
    <View style={styles.headerTitleWrap}>
      <Text style={styles.headerTitle}>{meta.title}</Text>
      <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Predict') {
                iconName = focused ? 'scan' : 'scan-outline';
              } else if (route.name === 'Consult') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'Inter_600SemiBold',
              marginBottom: 2,
            },
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: 10,
              paddingTop: 8,
              height: 72,
            },
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTitle: () => <HeaderTitle routeName={route.name} />,
            headerTitleAlign: 'left',
            headerLeftContainerStyle: {
              paddingLeft: 4,
            },
            headerRight: () => (
              <View style={styles.headerChip}>
                <Text style={styles.headerChipText}>v3.2</Text>
              </View>
            ),
            headerRightContainerStyle: {
              paddingRight: 12,
            },
            headerBackground: () => <View style={styles.headerBackground} />,
            sceneContainerStyle: {
              backgroundColor: '#f8fafc',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomePage} />
          <Tab.Screen name="Predict" component={PredictPage} />
          <Tab.Screen name="Consult" component={ConsultPage} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitleWrap: {
    paddingVertical: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginTop: 2,
  },
  headerChip: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerChipText: {
    color: '#2563eb',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});