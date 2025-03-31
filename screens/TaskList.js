import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import * as Progress from "react-native-progress";
import { useMode } from "../background/modeTheme";
import Icon from "react-native-vector-icons/Ionicons";

const interpolateColor = (progress, color1, color2) => {
  const hex = (x) => x.toString(16).padStart(2, "0");
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const TaskList = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const { mode } = useMode();
  const isDark = mode === "dark";

  const fetchTasks = async () => {
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "guest";
      const querySnapshot = await getDocs(collection(db, "users", userId, "tasks"));

      let taskList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort: starred tasks first
      taskList.sort((a, b) => {
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
        return 0;
      });

      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const calculateProgress = (task) => {
    const subtasks = task.subtasks || [];
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter((sub) => sub.completed).length;
    return completed / subtasks.length;
  };

  const toggleStar = async (task) => {
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "guest";
      const taskRef = doc(db, "users", userId, "tasks", task.id);
      await updateDoc(taskRef, { starred: !task.starred });
      fetchTasks(); // Refresh
    } catch (error) {
      console.error("Failed to update star status:", error);
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
        onPress={() => navigation.navigate("MainPage")}
      >
        <Icon name="arrow-back" size={28} color={isDark ? "#fff" : "#333"} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
          📋 Your Tasks
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateTaskList")}
        >
          <Text style={styles.createTask}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const progress = calculateProgress(item);
          const gradientColor = interpolateColor(progress, "#FADADD", "#A188A6");

          return (
            <TouchableOpacity
              style={[
                styles.taskItem,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#fff",
                  borderColor: isDark ? "#444" : "#ddd",
                },
              ]}
              onPress={() =>
                navigation.navigate("EditTaskList", {
                  task: item,
                  onDelete: fetchTasks,
                })
              }
            >
              <View style={styles.taskHeader}>
                <Text
                  style={[
                    styles.taskTitle,
                    { color: isDark ? "#fff" : "#222" },
                  ]}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => toggleStar(item)}>
                  <Icon
                    name={item.starred ? "star" : "star-outline"}
                    size={24}
                    color={item.starred ? "#FFD700" : isDark ? "#bbb" : "#666"}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.progressWrapper}>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  height={10}
                  borderRadius={5}
                  color={gradientColor}
                  unfilledColor={isDark ? "#555" : "#f3e5f5"}
                  borderWidth={0}
                />
                <Text
                  style={[
                    styles.percentageText,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
  title: { fontSize: 26, fontWeight: "bold" },
  createButton: {
    backgroundColor: "#9B59B6",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  createTask: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  taskItem: {
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  taskHeader: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginLeft: 1,
  
  },
  taskTitle: { fontSize: 18 },
  progressWrapper: { marginTop: 5 },
  percentageText: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "right",
  },
});

export default TaskList;
