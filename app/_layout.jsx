import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Image } from 'react-native';

const CustomTabBarIcon = ({ route, color, size, focused }) => {
  let icon = 'ellipse';
  if (route.name === 'index') icon = 'home';
  if (route.name === 'diveai') icon = 'chatbubbles';
  if (route.name === 'add-dive') icon = 'add-circle';
  if (route.name === 'divelog') icon = 'book';
  if (route.name === 'more') icon = 'ellipsis-horizontal';

  if (route.name === 'add-dive') {
    return (
      <View style={styles.addButton}>
        <Ionicons name={icon} size={size + 10} color={'#FFFFFF'} />
      </View>
    );
  }

  return <Ionicons name={icon} size={size} color={color} />;
};

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <CustomTabBarIcon route={route} color={color} size={size} focused={focused} />
        ),
        tabBarActiveTintColor: '#1F7A8C',
        tabBarInactiveTintColor: '#3A506B',
        tabBarLabelStyle: { fontSize: 11 },
        headerTitleAlign: 'center',
        headerTitle: route.name === 'index' ? 'EcoDive' : undefined,
        headerRight: () => (
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12, borderWidth: 2, borderColor: '#A8DADC' }}
          />
        ),
        headerStyle: { backgroundColor: '#4cc5ff' },
        headerTitleStyle: { color: '#F5F5F5', fontWeight: '700' },
        tabBarStyle: {
          height: 90,
          paddingBottom: 8,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#4cc5ff',
          borderTopWidth: 1
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="diveai" options={{ title: 'DiveAI', tabBarLabel: 'DiveAI' }} />
      <Tabs.Screen 
        name="add-dive" 
        options={{ 
          title: 'Add Dive', 
          tabBarLabel: 'Add Dive',
          tabBarIconStyle: { marginTop: -24 },
          tabBarLabelStyle: { marginTop: 16 }
        }} 
      />
      <Tabs.Screen name="divelog" options={{ title: 'Dive Log', tabBarLabel: 'Dive Log' }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarLabel: 'More' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 34,
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});


