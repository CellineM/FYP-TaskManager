import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useMode } from "../background/modeTheme";

const CreateTaskList = ({ navigation }) => {
  const { mode } = useMode();
  const isDark = mode === "dark";

  const [title, isTitle] = useState("");
  const [deadline, isDeadline] = useState(new Date());
  const [chosenDate, isChosenDate] = useState(false);
  const [storeTask, isStoreTask] = useState([]);
  const [subtask, isSubtask] = useState("");

  const handleDate = (_, dateChosen) => {
    if (dateChosen) isDeadline(dateChosen);
    isChosenDate(false);
  };

  const addTask = () => {
    if (subtask.trim()) {
      isStoreTask((prev) => [
        ...prev,
        { id: Date.now().toString(), text: subtask, completed: false },
      ]);
      isSubtask("");
    }
  };

  const toggleSubtask = (id) => {
    isStoreTask((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    isStoreTask((prev) => prev.filter((task) => task.id !== id));
  };

  const saveTask = async () => {
    if (!title.trim()) return alert("Please input a title!");

    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";

    try {
      await addDoc(collection(db, "users", userId, "tasks"), {
        title,
        deadline: deadline.toISOString(),
        subtasks: storeTask,
        createdAt: new Date().toISOString(),
      });
      alert("Task Saved!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert("Error saving task.");
    }
  };

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
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back"
          size={28}
          color={isDark ? "#fff" : "#333"}
        />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        📝 Create New Task
      </Text>

      <TextInput
        placeholder="Enter task title"
        value={title}
        onChangeText={isTitle}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
        placeholderTextColor={isDark ? "#888" : "#888"}
      />

      <TouchableOpacity
        style={styles.deadlineButton}
        onPress={() => isChosenDate(true)}
      >
        <Text style={styles.deadlineText}>
          📅 Deadline: {deadline.toDateString()}
        </Text>
      </TouchableOpacity>

      {chosenDate && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={handleDate}
        />
      )}

      <View style={styles.subtaskContainer}>
        <TextInput
          placeholder="Enter subtask"
          value={subtask}
          onChangeText={isSubtask}
          style={[
            styles.subtaskInput,
            {
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#444" : "#ccc",
            },
          ]}
          placeholderTextColor={isDark ? "#888" : "#888"}
        />
        <TouchableOpacity style={styles.addSubtaskButton} onPress={addTask}>
          <Text style={styles.addSubtaskText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={storeTask}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.subtaskItem,
              { backgroundColor: isDark ? "#2b2b2b" : "#f9f9f9" },
            ]}
          >
            <TouchableOpacity onPress={() => toggleSubtask(item.id)}>
              <Icon
                name={item.completed ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.subtaskText,
                {
                  color: isDark ? "#eee" : "#000",
                  textDecorationLine: item.completed ? "line-through" : "none",
                  opacity: item.completed ? 0.6 : 1,
                },
              ]}
            >
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Icon name="delete" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
        <Text style={styles.createText}>💾 Save Task</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 40,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  deadlineButton: {
    backgroundColor: "#9B59B6",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  deadlineText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  subtaskInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  addSubtaskButton: {
    backgroundColor: "#28a745",
    padding: 12,
    marginLeft: 10,
    borderRadius: 10,
  },
  addSubtaskText: { color: "#fff", fontWeight: "bold" },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  subtaskText: {
    fontSize: 16,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#9B59B6",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  createText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default CreateTaskList;
