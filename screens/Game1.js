import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal} from "react-native";
import { Audio } from "expo-av"; // 🔊 For playing audio
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const cardEmoji = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
  "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🦋",
  "🐌", "🐞", "🐜", "🪰", "🪿", "🐢", "🐍", "🦎", "🐙", "🦑",
  "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🪽"
];

const screenWidth = Dimensions.get("window").width;
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
const generateCards = (count) => {
  const selected = shuffle(cardEmoji).slice(0, count / 2);
  return shuffle([...selected, ...selected]);
};

const Game1 = () => {
  const navigation = useNavigation();
  const [noOfCard, isNoOfCard] = useState(16);
  const [level, isLevel] = useState(1);
  const [cards, isCards] = useState(generateCards(16));
  const [flipped, isFlipped] = useState([]);
  const [match, isMatch] = useState([]);
  const [disabled, isDisabled] = useState(false);
  const [score, isScore] = useState(0);
  const [moves, isMoves] = useState(0);
  const [timeLeft, isTimeLeft] = useState(120);
  const [showModal, isShowModal] = useState(false);
  const [savedHighScore, isSavedHighScore] = useState(0);

  const timerRef = useRef(null);
  const numColumns = Math.floor(Math.sqrt(noOfCard));
  const cardSize = (screenWidth - (numColumns + 1) * 12) / numColumns;

  const cardFlipSound = useRef(new Audio.Sound());
  const loseSound = useRef(new Audio.Sound());


  const playCardFlipSound = async () => {
    try {
      await cardFlipSound.current.unloadAsync();
      await cardFlipSound.current.loadAsync(require("../assets/sound/card_flip.mp3"));
      await cardFlipSound.current.setIsLoopingAsync(true);
      await cardFlipSound.current.playAsync();
    } catch (err) {
      console.error("Error playing bg sound:", err);
    }
  };

  const stopCardFlipSound = async () => {
    try {
      await cardFlipSound.current.stopAsync();
      await cardFlipSound.current.unloadAsync();
    } catch (err) {
      console.error("Error stopping bg sound:", err);
    }
  };

  const playLoseSound = async () => {
    try {
      await loseSound.current.unloadAsync();
      await loseSound.current.loadAsync(require("../assets/sound/lose.mp3"));
      await loseSound.current.setIsLoopingAsync(false); // just to be safe
      await loseSound.current.playAsync();
    } catch (err) {
      console.error("Error playing lose sound:", err);
    }
  };

  useEffect(() => {
    fetchHighScore();
    startTimer();
    playCardFlipSound();

    return () => {
      clearInterval(timerRef.current);
      stopCardFlipSound();
    };
  }, [noOfCard]);

  const fetchHighScore = async () => {
    const user = auth.currentUser;
    if (user) {
      const scoreRef = doc(db, "game1_scores", user.uid);
      const scoreSnap = await getDoc(scoreRef);
      if (scoreSnap.exists()) {
        isSavedHighScore(scoreSnap.data().highScore);
      }
    } else {
      const guestHighScore = await AsyncStorage.getItem("guest_high_score");
      if (guestHighScore) isSavedHighScore(Number(guestHighScore));
    }
  };

  const saveHighScore = async (finalScore) => {
    const user = auth.currentUser;
    const newHighScore = Math.max(savedHighScore, finalScore);

    if (finalScore > savedHighScore) {
      isSavedHighScore(newHighScore);
      if (user) {
        const scoreRef = doc(db, "game1_scores", user.uid);
        await setDoc(scoreRef, { highScore: newHighScore });
      } else {
        await AsyncStorage.setItem("guest_high_score", newHighScore.toString());
      }
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    isTimeLeft(120);
    timerRef.current = setInterval(() => {
      isTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopCardFlipSound();
          playLoseSound();
          saveHighScore(score);
          isShowModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFlip = (index) => {
    if (disabled || flipped.includes(index) || match.includes(index)) return;
    isFlipped([...flipped, index]);
    isMoves((prev) => prev + 1);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      isDisabled(true);
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        isMatch([...match, first, second]);
        isScore((prev) => prev + 10);
      } else {
        isScore((prev) => Math.max(prev - 2, 0));
      }
      setTimeout(() => {
        isFlipped([]);
        isDisabled(false);
      }, 800);
    }
  }, [flipped]);

  useEffect(() => {
    if (match.length === cards.length) {
      clearInterval(timerRef.current);
      setTimeout(() => {
        const nextLevel = level + 1;
        const nextCardNo = noOfCard + 4;
        isLevel(nextLevel);
        isNoOfCard(nextCardNo);
        isCards(generateCards(nextCardNo));
        isMatch([]);
        isFlipped([]);
        isMoves(0);
        startTimer();
      }, 1000);
    }
  }, [match]);

  const resetGame = () => {
    isLevel(1);
    isNoOfCard(16);
    isCards(generateCards(16));
    isFlipped([]);
    isMatch([]);
    isScore(0);
    isMoves(0);
    isShowModal(false);
    playCardFlipSound();
    startTimer();
  };

  const handleReturn = () => {
    saveHighScore(score);
    stopCardFlipSound();
    isShowModal(false);
    navigation.navigate("MainPage", { screen: "Games" });
  };

  const renderCard = ({ item, index }) => {
    const isFlipped = flipped.includes(index) || match.includes(index);
    return (
      <TouchableOpacity
        key={index}
        style={[styles.card, { width: cardSize, height: cardSize }]}
        onPress={() => handleFlip(index)}
      >
        <Text style={styles.cardText}>{isFlipped ? item : "❓"}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnBtn} onPress={handleReturn}>
        <Icon name="arrow-back" size={26} color="#3B3B98" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
        <Icon name="refresh" size={26} color="#3B3B98" />
      </TouchableOpacity>

      <Text style={styles.title}>Memory Match</Text>
      <Text style={styles.stats}>
        🕐 {timeLeft}s | 🎯 Score: {score} | 🏆 Level {level}
      </Text>

      <FlatList
        key={`grid-${noOfCard}`}
        data={cards}
        renderItem={({ item, index }) => renderCard({ item, index })}
        keyExtractor={(_, index) => index.toString()}
        numColumns={numColumns}
        scrollEnabled={true}
        contentContainerStyle={styles.grid}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏰ Time's Up!</Text>
            <Text style={styles.modalText}>You reached Level {level}</Text>
            <Text style={styles.modalText}>Your Score: {score}</Text>
            <Text style={styles.modalText}>High Score: {savedHighScore}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
              <Text style={styles.modalButtonText}>🔁 Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleReturn}>
              <Text style={styles.modalButtonText}>🏠 Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, alignItems: "center", backgroundColor: "#fff0f6" },
  returnBtn: { position: "absolute", top: 40, left: 20, zIndex: 1, backgroundColor: "#f5dcff", padding: 8, borderRadius: 10 },
  restartBtn: { position: "absolute", top: 40, right: 20, zIndex: 1, backgroundColor: "#f5dcff", padding: 8, borderRadius: 10 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#3B3B98" },
  stats: { fontSize: 16, marginBottom: 10, color: "#333" },
  grid: { justifyContent: "center", paddingBottom: 20 },
  card: { margin: 4, backgroundColor: "#3B3B98", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardText: { fontSize: 24, color: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 30, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 18, marginBottom: 10 },
  modalButton: { backgroundColor: "#9e8cc2", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10 },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default Game1;
