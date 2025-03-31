import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useMode } from "../background/modeTheme"; // light/dark mode

const MainPage = ({ navigation }) => {
  const { mode } = useMode();
  const isDarkMode = mode === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
        TaskTastik
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.taskButton, { backgroundColor: "#69bfcf" }]}
          onPress={() => navigation.navigate("TaskList")}
        >
          <Text style={styles.buttonText}>📋 Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.taskButton, { backgroundColor: "#69adcf" }]}
          onPress={() => navigation.navigate("NoteList")}
        >
          <Text style={styles.buttonText}>🗒️ Notes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20, // adds spacing between buttons
  },
  taskButton: {
    padding: 20,
    borderRadius: 10,
    width: 140,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MainPage;
