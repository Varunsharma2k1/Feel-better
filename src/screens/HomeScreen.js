import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation for the heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      <View style={styles.centerContainer}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <Text style={styles.mainMessage}>
            You will be fine soon{"\n"}my cutuu bachha!
          </Text>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }], marginTop: 30 }}>
          <Text style={styles.bigHeart}>🥺💖</Text>
        </Animated.View>

        <Text style={styles.subMessage}>
          Sending you endless love, hugs, and the warmest wishes for a speedy recovery. Just rest, smile, and know that you are deeply loved! 🧸✨
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.gameButton}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.gameButtonText}>Catch some kisses 💋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  mainMessage: {
    fontSize: Math.min(width * 0.1, 40),
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.12, 48),
    textShadowColor: 'rgba(255, 105, 180, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  bigHeart: {
    fontSize: 60,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: Math.min(width * 0.05, 20),
    color: colors.text,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.8,
  },
  gameButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
  },
  gameButtonText: {
    color: colors.card,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
