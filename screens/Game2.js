import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Audio } from 'expo-av';

const Game2 = ({ navigation }) => {
  const [targetWord, isTargetWord] = useState('');
  const [currentInput, isCurrentInput] = useState('');
  const [guesses, isGuesses] = useState([]);
  const [shownMessage, isShownMessage] = useState('');
  const [letterHints, isLetterHints] = useState({});
  const [currentScore, isCurrentScore] = useState(0);
  const [highScore, isHighScore] = useState(0);
  const [popupVisible, isPopupVisible] = useState(false);
  const [currentLevel, isCurrentLevel] = useState(1);
  const [letterHintsLeft, isLetterHintsLeft] = useState(3);
  const [keyboardHintsLeft, isKeyboardHintsLeft] = useState(3);

  const maxGuesses = 6;

  const wordleSound = useRef(new Audio.Sound());
  const loseSound = useRef(new Audio.Sound());

  const playWordleSound = async () => {
    try {
      await wordleSound.current.unloadAsync();
      await wordleSound.current.loadAsync(require('../assets/sound/wordle.mp3'));
      await wordleSound.current.setIsLoopingAsync(true);
      await wordleSound.current.playAsync();
    } catch (err) {
      console.error('Error playing background sound:', err);
    }
  };

  const stopWordleSound = async () => {
    try {
      await wordleSound.current.stopAsync();
    } catch (err) {
      console.error('Error stopping background sound:', err);
    }
  };

  const playLoseSound = async () => {
    try {
      await loseSound.current.unloadAsync();
      await loseSound.current.loadAsync(require('../assets/sound/lose.mp3'));
      await loseSound.current.playAsync();
    } catch (err) {
      console.error('Error playing lose sound:', err);
    }
  };

  useEffect(() => {
    playWordleSound();
    return () => {
      stopWordleSound();
    };
  }, [currentLevel]);

  useEffect(() => {
    const loadHighScore = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'game2_scores', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          isHighScore(docSnap.data().highScore);
        }
      } else {
        const saved = await AsyncStorage.getItem('game2_high_score');
        if (saved) isHighScore(parseInt(saved, 10));
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    fetchWordsForNewGame();
  }, [currentLevel]);

  const fetchWordsForNewGame = () => {
    fetch('https://api.datamuse.com/words?sp=?????&max=1000&md=f&fw=g')
      .then((response) => response.json())
      .then((data) => {
        const filteredWords = data
          .filter((word) => /^[A-Z]{5}$/.test(word.word.toUpperCase()))
          .map((word) => word.word.toUpperCase());

        const random = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        isTargetWord(random);
        isGuesses([]);
        isCurrentInput('');
        isShownMessage('');
        isLetterHints({});
        isPopupVisible(false);
      })
      .catch((error) => Alert.alert('Error fetching words', error.message));
  };

  const saveHighScore = async (score) => {
    const user = auth.currentUser;
    if (score > highScore) {
      isHighScore(score);
      if (user) {
        await setDoc(doc(db, 'game2_scores', user.uid), { highScore: score });
      } else {
        await AsyncStorage.setItem('game2_high_score', score.toString());
      }
    }
  };

  const handleGuess = () => {
    if (currentInput.length !== 5) {
      isShownMessage('Only enter a 5-letter word.');
      return;
    }

    const updatedGuesses = [...guesses, currentInput];
    isGuesses(updatedGuesses);
    isCurrentInput('');

    if (currentInput === targetWord) {
      const newScore = currentScore + 1;
      isCurrentScore(newScore);
      saveHighScore(newScore);
      setTimeout(() => isCurrentLevel((prev) => prev + 1), 800);
    } else if (updatedGuesses.length === maxGuesses) {
      isShownMessage(`Game Over! The word was ${targetWord}`);
      isPopupVisible(true);
      saveHighScore(currentScore);
      stopWordleSound();
      playLoseSound();
    }
  };

  const giveHint = (type) => {
    if (type === 'letter' && letterHintsLeft > 0) {
      const unrevealedLetters = targetWord
        .split('')
        .filter((letter) => !Object.keys(letterHints).includes(letter));

      if (unrevealedLetters.length === 0) {
        isShownMessage('All letters already revealed!');
        return;
      }

      const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
      isLetterHints((prev) => ({ ...prev, [randomLetter]: false }));
      isLetterHintsLeft((prev) => prev - 1);
      isShownMessage(`Hint: One of the letters is '${randomLetter}'`);
    } else if (type === 'keyboard' && keyboardHintsLeft > 0) {
      const hintLetters = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
        if (!targetWord.includes(letter)) {
          hintLetters[letter] = true;
        }
      });
      isLetterHints(hintLetters);
      isKeyboardHintsLeft((prev) => prev - 1);
    } else {
      isShownMessage('No more hints available.');
    }
  };

  const handleLetterPress = (letter) => {
    if (currentInput.length < 5) {
      isCurrentInput((prev) => prev + letter);
    }
  };

  const handleErase = () => {
    isCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleRestart = () => {
    isCurrentScore(0);
    isCurrentLevel(1);
    isLetterHints({});
    isLetterHintsLeft(3);
    isKeyboardHintsLeft(3);
    fetchWordsForNewGame();
    isPopupVisible(false);
    playWordleSound();
  };

  const handleReturn = () => {
    isPopupVisible(false);
    stopWordleSound();
    navigation.navigate("MainPage", { screen: "Games" });
  };

  const getLetterFeedback = (letter, index) => {
    if (!letter) return {};
    if (targetWord[index] === letter) return styles.correct;
    if (targetWord.includes(letter)) return styles.present;
    return styles.absent;
  };

  const renderGuessRow = (guess) => {
    const letters = guess ? guess.split('') : Array(5).fill('');
    return (
      <View style={styles.guessRow}>
        {letters.map((letter, index) => (
          <Text key={index} style={[styles.letter, getLetterFeedback(letter, index)]}>
            {letter}
          </Text>
        ))}
      </View>
    );
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.backBtn} onPress={handleReturn}>
        <Icon name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Wordle Clone</Text>

      <View style={styles.rowScore}>
        <Text style={styles.scoreText}>🏆 Level: {currentLevel}</Text>
        <Text style={styles.scoreText}>🎯 Score: {currentScore}</Text>
      </View>

      <FlatList
        data={[...guesses, ...Array(maxGuesses - guesses.length).fill(null)]}
        renderItem={({ item }) => renderGuessRow(item)}
        keyExtractor={(item, index) => index.toString()}
      />

      <Text style={styles.currentInput}>{currentInput}</Text>

      <View style={styles.keyboard}>
        {alphabet.map((letter) => (
          <TouchableOpacity
            key={letter}
            style={[styles.key, letterHints[letter] && styles.disabledKey]}
            onPress={() => handleLetterPress(letter)}
            disabled={letterHints[letter]}>
            <Text>{letter}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={handleErase}>
          <Text>⌫</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleGuess}>
          <Text>➡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintButtons}>
        <TouchableOpacity onPress={() => giveHint('letter')} style={styles.hintBtn}>
          <Icon name="lightbulb-outline" size={24} color="#333" />
          <Text> ({letterHintsLeft})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => giveHint('keyboard')} style={styles.hintBtn}>
          <Icon name="keyboard" size={24} color="#333" />
          <Text> ({keyboardHintsLeft})</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.shownMessage}>{shownMessage}</Text>

      <Modal visible={popupVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏰ Game Over</Text>
            <Text style={styles.modalText}>Score: {currentScore}</Text>
            <Text style={styles.modalText}>High Score: {highScore}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleRestart}>
              <Text style={styles.modalBtnText}>🔁 Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleReturn}>
              <Text style={styles.modalBtnText}>🏠 Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  rowScore: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 45,
    marginBottom: 5,
    marginTop: -4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  guessRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  letter: {
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    fontWeight: "bold",
    borderColor: "#ddd",
    borderWidth: 2,
    margin: 2,
    backgroundColor: "#fff",
    color: "#000",
  },
  correct: { backgroundColor: "#6aaa64", color: "#fff" },
  present: { backgroundColor: "#c9b458", color: "#fff" },
  absent: { backgroundColor: "#787c7e", color: "#fff" },
  currentInput: {
    fontSize: 20,
    marginVertical: 10,
  },
  keyboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  key: {
    width: 35,
    height: 35,
    backgroundColor: "#eee",
    margin: 3,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  disabledKey: {
    backgroundColor: "#ccc",
  },
  shownMessage: {
    marginTop: 15,
    fontSize: 16,
  },
  hintButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 8,
    marginBottom: 0,
    gap: 10,
  },
  hintBtn: {
    padding: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 18, marginBottom: 10 },
  modalBtn: {
    backgroundColor: "#9e8cc2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default Game2;
