import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useMode } from "../background/modeTheme";

const GamePage = ({ navigation }) => {
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#2C1B47" : "#fff0f6" }, // Soft pink background
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDarkMode ? "#fff" : "#4B4453" },
        ]}
      >
        🎮 Choose a Game
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#E0BBE4" }]}
          onPress={() => navigation.navigate("Game1")}
        >
          <Text style={styles.buttonText}>🃏 Card Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#D291BC" }]}
          onPress={() => navigation.navigate("Game2")}
        >
          <Text style={styles.buttonText}>🔠 Wordle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FEC8D8" }]}
          onPress={() => navigation.navigate("Game3")}
        >
          <Text style={styles.buttonText}>💣 Minesweeper</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "85%",
    gap: 20,
  },
  button: {
    paddingVertical: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B4453",
  },
});

export default GamePage;
