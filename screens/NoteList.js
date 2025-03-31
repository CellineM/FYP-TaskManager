import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import { useMode } from "../background/modeTheme";

const NoteList = ({ navigation }) => {
  const [notes, isNotes] = useState([]);
  const { mode } = useMode();
  const isDark = mode === "dark";

  const fetchNotes = async () => {
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "guest";
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "notes")
      );

      const notesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      isNotes(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate("MainPage")}
      >
        <Icon name="arrow-back" size={28} color={isDark ? "#fff" : "#333"} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
          🗒️ Your Notes
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateNoteList")}
        >
          <Text style={styles.createText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.noteItem,
              {
                backgroundColor: isDark ? "#3c2f66" : "#fff",
                borderColor: isDark ? "#555" : "#ddd",
              },
            ]}
            onPress={() =>
              navigation.navigate("EditNoteList", {
                note: item,
                onDelete: fetchNotes,
              })
            }
          >
            <Text
              style={[
                styles.noteTitle,
                { color: isDark ? "#fff" : "#222" },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#9B59B6",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  createText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noteItem: {
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default NoteList;
