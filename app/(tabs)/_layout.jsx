import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Image } from 'react-native';

const CustomTabBarIcon = ({ route, color, size, focused }) => {
  let icon = 'ellipse';
  if (route.name === 'home') icon = 'home';
  if (route.name === 'Dive-AI/index') icon = 'chatbubbles';
  if (route.name === 'Add-Dive') icon = 'add-circle';
  if (route.name === 'Dive-Log/index') icon = 'book';
  if (route.name === 'More/index') icon = 'ellipsis-horizontal';

  if (route.name === 'Add-Dive') {
    return (
      <View style={styles.addButton}>
        <Ionicons name={icon} size={size + 10} color={'#FFFFFF'} />
      </View>
    );
  }

  return <Ionicons name={icon} size={size} color={color} />;
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <CustomTabBarIcon route={route} color={color} size={size} focused={focused} />
        ),
        tabBarActiveTintColor: '#4cc5ff',
        tabBarInactiveTintColor: '#3A506B',
        tabBarLabelStyle: { fontSize: 11 },
        headerTitleAlign: 'center',
        headerTitle: route.name === 'home' ? 'EcoDive' : undefined,
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
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="Dive-AI/index" options={{ title: 'DiveAI', tabBarLabel: 'DiveAI' }} />
      <Tabs.Screen 
        name="Add-Dive" 
        options={{ 
          title: 'Add Dive', 
          tabBarLabel: 'Add Dive',
          tabBarIconStyle: { marginTop: -24 },
          tabBarLabelStyle: { marginTop: 16 }
        }} 
      />
      <Tabs.Screen name="Dive-Log/index" options={{ title: 'Dive Log', tabBarLabel: 'Dive Log' }} />
      <Tabs.Screen name="More/index" options={{ title: 'More', tabBarLabel: 'More' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#4cc5ff',
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
