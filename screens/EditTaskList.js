import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useMode } from "../background/modeTheme";

const EditTaskList = ({ route, navigation }) => {
  const { task } = route.params;
  const { mode } = useMode();
  const isDark = mode === "dark";

  const [title, isTitle] = useState(task.title);
  const [subtasks, isSubtask] = useState(task.subtasks || []);

  const toggleTask = async (id) => {
    const updated = subtasks.map((sub) =>
      sub.id === id ? { ...sub, completed: !sub.completed } : sub
    );
    isSubtask(updated);

    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";
    try {
      await updateDoc(doc(db, "users", userId, "tasks", task.id), {
        subtasks: updated,
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const saveTask = async () => {
    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";
    try {
      await updateDoc(doc(db, "users", userId, "tasks", task.id), {
        title,
        subtasks,
      });
      alert("Task Updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task.");
    }
  };

  const deleteTask = async () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const user = auth.currentUser;
          const userId = user ? user.uid : "guest";
          try {
            await deleteDoc(doc(db, "users", userId, "tasks", task.id));
            alert("Task Deleted!");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting task:", error);
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      {/* Top Bar: Back & Delete */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteTask}>
          <Ionicons name="trash" size={28} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        📝 Edit Task
      </Text>

      <Text style={[styles.sectionLabel, { color: isDark ? "#bbb" : "#333" }]}>
        Title
      </Text>
      <TextInput
        placeholder="Enter Task Title"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={title}
        onChangeText={isTitle}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#3c2f66" : "#f2f2f2",
            color: isDark ? "#fff" : "#000",
          },
        ]}
      />

      <Text style={[styles.sectionLabel, { color: isDark ? "#bbb" : "#333" }]}>
        Subtasks
      </Text>
      <FlatList
        data={subtasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.subtaskItem,
              { backgroundColor: isDark ? "#3c2f66" : "#f9f9f9" },
            ]}
          >
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Icon
                name={item.completed ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={isDark ? "#fff" : "black"}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.subtaskText,
                { color: isDark ? "#fff" : "#000" },
                item.completed && styles.completedSubtask,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Save Button bottom right */}
      <View style={styles.bottomRight}>
        <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
          <Text style={styles.saveText}>💾 Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    position: "relative",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  subtaskText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  completedSubtask: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  bottomRight: {
    position: "absolute",
    bottom: 25,
    right: 20,
  },
  saveButton: {
    backgroundColor: "#6a5acd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditTaskList;
