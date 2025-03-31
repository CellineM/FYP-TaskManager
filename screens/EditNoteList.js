import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useMode } from "../background/modeTheme";

const EditNoteList = ({ route, navigation }) => {
  const { note, onDelete } = route.params;
  const { mode } = useMode();
  const isDark = mode === "dark";

  const [title, setTitle] = useState(note.title);
  const [noteDetails, setNoteDetails] = useState(note.noteDetails);

  const saveNote = async () => {
    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";

    try {
      await updateDoc(doc(db, "users", userId, "notes", note.id), {
        title,
        noteDetails,
        updatedAt: new Date().toISOString(),
      });

      alert("Note updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note.");
    }
  };

  const deleteNote = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const user = auth.currentUser;
          const userId = user ? user.uid : "guest";

          try {
            await deleteDoc(doc(db, "users", userId, "notes", note.id));
            if (onDelete) onDelete();
            alert("Note deleted!");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#2C1B47" : "#fff0f6" }]}>
      
      {/* Top Buttons */}
      <View style={styles.returnButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={isDark ? "#fff" : "#333"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteNote}>
          <Icon name="trash-outline" size={26} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>✏️ Edit Note</Text>

      <Text style={[styles.label, { color: isDark ? "#eee" : "#555" }]}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#3c2f66" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#555" : "#ccc",
          },
        ]}
        placeholder="Enter title"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
      />

      <Text style={[styles.label, { color: isDark ? "#eee" : "#555" }]}>Note</Text>
      <ScrollView style={styles.textAreaWrapper}>
        <TextInput
          value={noteDetails}
          onChangeText={setNoteDetails}
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
          placeholder="Write your note..."
          placeholderTextColor={isDark ? "#aaa" : "#999"}
        />
      </ScrollView>

      {/* Save Button - bottom right */}
      <View style={styles.bottomRight}>
        <TouchableOpacity onPress={saveNote} style={styles.saveButton}>
          <Text style={styles.saveText}>💾 Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  returnButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
  bottomRight: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#9B59B6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditNoteList;
