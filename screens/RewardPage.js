import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import * as Progress from "react-native-progress";
import { useMode } from "../background/modeTheme";

const profileRewards = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🦁", "🐯", "🐨", "🐸", "🐵", "🐔", "🐧", "🐦",
];

const RewardPage = () => {
  const [taskCompleted, isTaskCompleted] = useState(0);
  const { mode } = useMode();
  const isDark = mode === "dark";

  useEffect(() => {
    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";

    const tasksRef = collection(db, "users", userId, "tasks");

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const subtasks = data.subtasks || [];
        total += subtasks.filter((sub) => sub.completed).length;
      });
      isTaskCompleted(total);
    });

    return () => unsubscribe();
  }, []);

  const level = Math.floor(taskCompleted / 10);
  const progress = (taskCompleted % 10) / 10;

  const unlockedEmoji = profileRewards.slice(0, Math.floor(taskCompleted / 5));


  const handleSelectEmoji = async (emoji) => {
    const user = auth.currentUser;
    if (!user) return alert("Emoji only can be access by a user. Sign Up for an account!");

    try {
      await setDoc(doc(db, "users", user.uid), { profileEmoji: emoji }, { merge: true });
      alert("Profile emoji updated!");
    } catch (error) {
      console.error("Error getting profile emoji:", error);
      alert("Failed to get emoji. Check permissions.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
        🏆 Your Rewards
      </Text>

      <Text style={[styles.level, { color: isDark ? "#fff" : "#444" }]}>
        Level {level}
      </Text>

      <Progress.Bar
        progress={progress}
        width={300}
        height={20}
        borderRadius={10}
        color="#FFD700"
        unfilledColor={isDark ? "#4a3966" : "#ffeeba"}
        borderWidth={0}
      />
      <Text style={[styles.progressText, { color: isDark ? "#ddd" : "gray" }]}>
        {Math.round(progress * 100)}% to Level {level + 1}
      </Text>

      <Text style={[styles.sectionText, { color: isDark ? "#fff" : "#333" }]}>
        🎨 Profile Emoji (Tap to set as your profile picture!)
      </Text>

      <View style={styles.emojiGrid}>
        {unlockedEmoji.length === 0 ? (
          <Text style={[styles.rewardText, { color: isDark ? "#aaa" : "#888" }]}>
            No emojis unlocked yet. Finish Task to unlocked! 💪
          </Text>
        ) : (
          unlockedEmoji.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiBox}
              onPress={() => handleSelectEmoji(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    alignItems: "center", 
    padding: 20, 
    flexGrow: 1 
  },

  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10, 
    marginTop: 40 
  },

  level: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 10 
  },

  progressText: { 
    marginTop: 8, 
    fontSize: 16 
  },

  sectionText: { 
    marginTop: 30, 
    fontSize: 20, 
    fontWeight: "bold", 
    alignSelf: "flex-start" 
  },

  emojiGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    marginTop: 10 
  },

  emojiBox: { 
    width: 60, 
    height: 60, 
    margin: 8,
    backgroundColor: "#eee", 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 2,
  },

  emoji: { 
    fontSize: 28 
  },

  rewardText: { 
    fontSize: 16, 
    textAlign: "center", 
    marginTop: 20 
  },
});

export default RewardPage;
