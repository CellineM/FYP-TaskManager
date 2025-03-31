import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { useMode } from "../background/modeTheme";

const CreateNoteList = ({ navigation }) => {
  const [title, isTitle] = useState("");
  const [noteDetails, isnoteDetails] = useState("");
  const { mode } = useMode();
  const isDark = mode === "dark";

  const saveNote = async () => {
    if (!title.trim()) {
      alert("Enter the title Please");
      return;
    }

    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "guest";

      await addDoc(collection(db, "users", userId, "notes"), {
        title,
        noteDetails,
        createdAt: new Date().toISOString(),
      });

      alert("The note is saved!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving the note:", error);
      alert("Failed to save the note.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      {/* 🔙 Return Button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} color={isDark ? "#fff" : "#333"} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
        📝 New Note
      </Text>

      <Text style={[styles.label, { color: isDark ? "#eee" : "#555" }]}>
        Title
      </Text>
      <TextInput
        placeholder="Enter title"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
        value={title}
        onChangeText={isTitle}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#3c2f66" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#555" : "#ccc",
          },
        ]}
      />

      <Text style={[styles.label, { color: isDark ? "#eee" : "#555" }]}>
        Note
      </Text>
      <ScrollView style={styles.textAreaWrapper}>
        <TextInput
          placeholder="Write your note here..."
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={noteDetails}
          onChangeText={isnoteDetails}
          multiline
          textAlignVertical="top"
          style={[
            styles.textArea,
            {
              backgroundColor: isDark ? "#3c2f66" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#555" : "#ccc",
            },
          ]}
        />
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
        <Text style={styles.saveText}>💾 Save Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  returnButton: {
    position: "absolute",
    top: 20,
    left: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textAreaWrapper: { flex: 1 },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 200,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#9B59B6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateNoteList;
