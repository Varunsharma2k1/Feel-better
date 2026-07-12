import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const TARGET_SCORE = 10;
// 0: 💋 (Target), 1: 💖 (Avoid), 2: 🧸 (Neutral), 3: 🌸 (Neutral), 4: 🦋 (Neutral)
const EMOJIS = ['💋', '💖', '🧸', '🌸', '🦋'];

const MESSAGES = [
  "Sending you a million virtual hugs! 🧸",
  "You're the cutest even when you're sick! 🥺",
  "Drink water, gorgeous! 🥤",
  "I'm thinking about you! 💭💖",
  "Feel better soon, my love! 🌸",
  "You're my favorite person! 🥰",
  "Sending you healing kisses! 💋",
  "Take your meds and rest up! 💊💤"
];

const FallingItem = ({ id, xPos, onCatch, onMiss, speed, type }) => {
  const fallAnim = useRef(new Animated.Value(-50)).current;
  const [caught, setCaught] = useState(false);
  const caughtRef = useRef(false);

  useEffect(() => {
    Animated.timing(fallAnim, {
      toValue: height + 50,
      duration: speed,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // If it finished the animation (hit the bottom) and wasn't caught
      if (finished && !caughtRef.current) {
        onMiss(id, type);
      }
    });
  }, []);

  const handlePress = () => {
    if (!caughtRef.current) {
      caughtRef.current = true;
      setCaught(true);
      onCatch(id, type);
    }
  };

  if (caught) return null;

  return (
    <Animated.View
      style={[
        styles.fallingItemContainer,
        {
          left: xPos,
          transform: [{ translateY: fallAnim }]
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.touchableArea}>
        <Text style={styles.fallingIcon}>{EMOJIS[type]}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function GameScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const itemIdCounter = useRef(0);
  
  // Care Package states
  const [message, setMessage] = useState(null);
  const boxScale = useRef(new Animated.Value(1)).current;
  const heartsAnim = useRef(new Animated.Value(0)).current;

  // Use a ref for score so the interval gets the latest without redefining
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (gameWon || gameOver) return;

    const spawnItem = () => {
      const currentScore = scoreRef.current;
      const type = Math.floor(Math.random() * EMOJIS.length);
      
      // Speed up calculations: slightly faster fall but not too overwhelming
      const baseDuration = Math.max(2000, 3500 - (currentScore * 100));
      const speed = Math.random() * 1000 + baseDuration;
      
      const newItem = {
        id: itemIdCounter.current++,
        xPos: Math.random() * (width - 80),
        speed,
        type
      };
      
      setItems(prev => [...prev, newItem]);

      // Calculate next spawn interval (slower spawn rate so it's not too crowded)
      const baseInterval = Math.max(800, 1200 - (currentScore * 30));
      timerRef.current = setTimeout(spawnItem, baseInterval);
    };

    const timerRef = { current: setTimeout(spawnItem, 1000) };

    return () => clearTimeout(timerRef.current);
  }, [gameWon, gameOver]);

  const handleCatch = (id, type) => {
    if (type === 0) {
      // Caught a kiss!
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore >= TARGET_SCORE) {
          setGameWon(true);
        }
        return newScore;
      });
    } else if (type === 1) {
      // Caught a heart - oh no!
      setGameOverReason("Oops! You accidentally caught a heart instead of a kiss!");
      setGameOver(true);
    }
    
    // Remove caught item
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleMiss = (id, type) => {
    // If kiss (0) is missed, GAME OVER
    if (type === 0) {
      setGameOverReason("Oh no! A precious kiss fell away!");
      setGameOver(true);
    }
    // Remove it from state so it stops tracking
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Clean up off-screen items periodically to avoid memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setItems(prev => {
        if (prev.length > 25) {
          return prev.slice(prev.length - 25);
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(cleanupInterval);
  }, []);

  // Care Package Tap
  const handleTapBox = () => {
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);

    Animated.sequence([
      Animated.timing(boxScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(boxScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(boxScale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(boxScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    heartsAnim.setValue(0);
    Animated.timing(heartsAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const renderPackageHearts = () => {
    return Array.from({ length: 15 }).map((_, i) => {
      const startX = Math.random() * 200 - 100;
      const endX = startX + (Math.random() * 100 - 50);
      const endY = -(Math.random() * 300 + 100);
      
      const translateX = heartsAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [startX, endX],
      });
      const translateY = heartsAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, endY],
      });
      const opacity = heartsAnim.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0, 1, 0],
      });
      const scale = heartsAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1.5, 1],
      });

      return (
        <Animated.Text
          key={i}
          style={[
            styles.floatingHeart,
            {
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            }
          ]}
        >
          {['💖', '🧸', '💋', '🌸'][Math.floor(Math.random() * 4)]}
        </Animated.Text>
      );
    });
  };

  const resetGame = () => {
    setGameWon(false);
    setGameOver(false);
    setScore(0);
    setItems([]);
    setMessage(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreText}>Love Meter: {score} / {TARGET_SCORE}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {items.map(item => (
          <FallingItem
            key={item.id}
            id={item.id}
            xPos={item.xPos}
            speed={item.speed}
            type={item.type}
            onCatch={handleCatch}
            onMiss={handleMiss}
          />
        ))}
      </View>

      {/* Game Over Modal */}
      <Modal visible={gameOver} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🥺</Text>
            <Text style={styles.modalTitle}>Oh no!</Text>
            <Text style={styles.modalText}>
              {gameOverReason}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.modalButtonTextSecondary}>Give up for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Win Modal with Care Package */}
      <Modal visible={gameWon} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 400 }]}>
            <Text style={styles.modalTitle}>You filled the Love Meter! 🎉</Text>
            <Text style={styles.modalText}>
              Here is your reward! Tap the care package below.
            </Text>
            
            <View style={styles.boxContainer}>
              {renderPackageHearts()}
              <TouchableOpacity activeOpacity={0.8} onPress={handleTapBox}>
                <Animated.Text style={[styles.boxIcon, { transform: [{ scale: boxScale }] }]}>
                  🎁
                </Animated.Text>
              </TouchableOpacity>
            </View>

            <View style={styles.messageContainer}>
              {message && (
                <Animated.Text style={styles.messageText}>
                  {message}
                </Animated.Text>
              )}
            </View>

            <View style={styles.winButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, { flex: 1, marginRight: 10 }]} onPress={resetGame}>
                <Text style={styles.modalButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { flex: 1 }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.modalButtonTextSecondary}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreBoard: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  scoreText: {
    color: colors.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  fallingItemContainer: {
    position: 'absolute',
    top: 0,
  },
  touchableArea: {
    padding: 15,
  },
  fallingIcon: {
    fontSize: 45,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 192, 203, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  modalButtonTextSecondary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Care Package styles
  boxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: 150,
    marginVertical: 10,
  },
  boxIcon: {
    fontSize: 80,
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 25,
  },
  messageContainer: {
    height: 80,
    marginBottom: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  winButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  }
});
