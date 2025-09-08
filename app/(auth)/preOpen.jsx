import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const backgroundUri = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop';

export default function Launch() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: backgroundUri }}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.titleLine}>One small step for Humanity</Text>
          <Text style={[styles.titleLine, { marginTop: 6 }]}>One big step for the</Text>
          <Text style={[styles.titleLine, { marginTop: 6 }]}>enviorment</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.cta} onPress={handleGetStarted}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bg: { flex: 1, justifyContent: 'center' },
  bgImage: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  titleLine: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 6
  },
  cta: {
    marginTop: 28,
    backgroundColor: '#4cc5ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  }
});