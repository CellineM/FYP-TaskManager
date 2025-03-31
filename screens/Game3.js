import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av'; 
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const Game3 = ({ navigation }) => {
  const [level, isLevel] = useState(1);
  const [grid, isGrid] = useState([]);
  const [score, isScore] = useState(0);
  const [highScore, isHighScore] = useState(0);
  const [gameOver, isGameOver] = useState(false);
  const [popupVisible, isPopupVisible] = useState(false);

  const minesweeper = useRef(new Audio.Sound());
  const loseSound = useRef(new Audio.Sound());

  const playMinesweeperSound = async () => {
    try {
      await minesweeper.current.unloadAsync();
      await minesweeper.current.loadAsync(require('../assets/sound/minesweeper.mp3'));
      await minesweeper.current.setIsLoopingAsync(true);
      await minesweeper.current.playAsync();
    } catch (error) {
      console.error('🔊 Error playing background:', error);
    }
  };

  const stopMinesweeperSound = async () => {
    try {
      await minesweeper.current.stopAsync();
    } catch (error) {
      console.error('🛑 Error stopping background:', error);
    }
  };

  const playLoseSound = async () => {
    try {
      await loseSound.current.unloadAsync();
      await loseSound.current.loadAsync(require('../assets/sound/lose.mp3'));
      await loseSound.current.setIsLoopingAsync(false);
      await loseSound.current.playAsync();
    } catch (error) {
      console.error('🔊 Error playing lose sound:', error);
    }
  };

  const getGridSize = () => (level <= 5 ? 5 : level);
  const getBombCount = () => level;

  const createEmptyGrid = () => {
    const size = getGridSize();
    return Array(size).fill().map(() =>
      Array(size).fill().map(() => ({
        isRevealed: false,
        isBomb: false,
        isFlagged: false,
        adjacentBombs: 0,
      }))
    );
  };

  const placeBombs = (grid) => {
    let bombsPlaced = 0;
    const size = getGridSize();
    while (bombsPlaced < getBombCount()) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (!grid[row][col].isBomb) {
        grid[row][col].isBomb = true;
        bombsPlaced++;
      }
    }
    return grid;
  };

  const calculateAdjacents = (grid) => {
    const dirs = [-1, 0, 1];
    const size = getGridSize();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c].isBomb) continue;
        let count = 0;
        dirs.forEach((dr) => {
          dirs.forEach((dc) => {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 && nr < size &&
              nc >= 0 && nc < size &&
              !(dr === 0 && dc === 0) &&
              grid[nr][nc].isBomb
            ) {
              count++;
            }
          });
        });
        grid[r][c].adjacentBombs = count;
      }
    }
    return grid;
  };

  const generateGrid = () => {
    const newGrid = calculateAdjacents(placeBombs(createEmptyGrid()));
    isGrid(newGrid);
  };

  const saveHighScore = async (newScore) => {
    const user = auth.currentUser;
    if (newScore > highScore) {
      isHighScore(newScore);
      if (user) {
        await setDoc(doc(db, 'game3_scores', user.uid), { highScore: newScore });
      } else {
        await AsyncStorage.setItem('game3_high_score', newScore.toString());
      }
    }
  };

  useEffect(() => {
    const loadHighScore = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'game3_scores', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          isHighScore(docSnap.data().highScore);
        }
      } else {
        const saved = await AsyncStorage.getItem('game3_high_score');
        if (saved) isHighScore(parseInt(saved, 10));
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    generateGrid();
    playMinesweeperSound();
    return () => stopMinesweeperSound();
  }, [level]);

  const revealTile = (row, col) => {
    if (gameOver || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    const updatedGrid = [...grid];
    updatedGrid[row][col].isRevealed = true;

    if (updatedGrid[row][col].isBomb) {
      isGrid(updatedGrid);
      isGameOver(true);
      isPopupVisible(true);
      stopMinesweeperSound();
      playLoseSound();
      saveHighScore(score);
      return;
    }

    const newScore = score + 1;
    isScore(newScore);
    saveHighScore(newScore);

    if (updatedGrid[row][col].adjacentBombs === 0) {
      const dirs = [-1, 0, 1];
      const size = getGridSize();
      dirs.forEach((dr) => {
        dirs.forEach((dc) => {
          const nr = row + dr;
          const nc = col + dc;
          if (
            nr >= 0 && nr < size &&
            nc >= 0 && nc < size &&
            !(dr === 0 && dc === 0)
          ) {
            revealTile(nr, nc);
          }
        });
      });
    }

    isGrid([...updatedGrid]);

    const totalCells = getGridSize() ** 2;
    const totalBombs = getBombCount();
    const safeCells = totalCells - totalBombs;

    let revealedSafeCount = 0;
    updatedGrid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isRevealed && !cell.isBomb) revealedSafeCount++;
      })
    );

    if (revealedSafeCount === safeCells) {
      Alert.alert('✅ Level Cleared!', `Advancing to Level ${level + 1}`, [
        { text: 'Continue', onPress: () => isLevel((prev) => prev + 1) }
      ]);
    }
  };

  const handleLongPress = (row, col) => {
    if (gameOver || grid[row][col].isRevealed) return;
    const updatedGrid = [...grid];
    updatedGrid[row][col].isFlagged = !updatedGrid[row][col].isFlagged;
    isGrid(updatedGrid);
  };

  const handleRestart = () => {
    saveHighScore(score);
    isScore(0);
    isGameOver(false);
    isPopupVisible(false);
    isLevel(1);
    generateGrid();
    playMinesweeperSound();
  };

  const handleReturn = () => {
    stopMinesweeperSound();
    isPopupVisible(false);
    navigation.navigate("MainPage", { screen: "Games" });
  };

  const CELL_SIZE = width / getGridSize() - 10;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnBtn} onPress={handleReturn}>
        <Icon name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>💣 Minesweeper</Text>
      <Text style={styles.scoreText}>
        🏆 Level: {level} | 🎯 Score: {score} | 📈 High Score: {highScore}
      </Text>

      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.cell,
                { width: CELL_SIZE, height: CELL_SIZE },
                cell.isRevealed ? styles.revealed : styles.hidden,
                cell.isFlagged ? styles.flagged : null
              ]}
              onPress={() => revealTile(rowIndex, colIndex)}
              onLongPress={() => handleLongPress(rowIndex, colIndex)}
            >
              <Text>
                {cell.isRevealed
                  ? cell.isBomb
                    ? '💣'
                    : cell.adjacentBombs > 0
                      ? cell.adjacentBombs
                      : ''
                  : cell.isFlagged
                    ? '🚩'
                    : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Modal visible={popupVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💥 Game Over</Text>
            <Text style={styles.modalText}>Score: {score}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'flex-start', alignItems: 'center',
    backgroundColor: '#fff0f6', paddingTop: 60, paddingHorizontal: 10,
  },
  returnBtn: {
    position: 'absolute', top: 40, left: 20, zIndex: 1,
  },
  title: {
    fontSize: 28, fontWeight: 'bold', marginBottom: 10,
    color: '#3B3B98',
  },
  scoreText: {
    fontSize: 16, marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 4,
  },
  hidden: {
    backgroundColor: '#ccc',
  },
  revealed: {
    backgroundColor: '#eee',
  },
  flagged: {
    backgroundColor: '#fdd',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white', padding: 30,
    borderRadius: 10, alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10,
  },
  modalText: {
    fontSize: 18, marginBottom: 10,
  },
  modalBtn: {
    backgroundColor: '#9e8cc2', paddingVertical: 10,
    paddingHorizontal: 20, borderRadius: 5, marginTop: 10,
  },
  modalBtnText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  },
});

export default Game3;
