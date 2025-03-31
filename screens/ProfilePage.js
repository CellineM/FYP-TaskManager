import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useMode } from "../background/modeTheme";

const ProfilePage = ({ navigation }) => {
  const [user, isUser] = useState(null);
  const [profileEmoji, isProfileEmoji] = useState("🙂");
  const { mode, toggleMode } = useMode();
  const isDarkMode = mode === "dark";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (userInfo) => {
      isUser(userInfo);
      if (userInfo) {
        const docRef = doc(db, "users", userInfo.uid);
        const unsubscribeProfile = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            isProfileEmoji(data.profileEmoji || "🙂");
          }
        });
        return () => unsubscribeProfile();
      } else {
        isProfileEmoji("🙂");
      }
    });

    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Start");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#2C1B47" : "#fff0f6" },
      ]}
    >
      <View>
        <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
          Profile
        </Text>
      </View>

      <View style={styles.emojiWrapper}>
        <Text style={styles.emoji}>{profileEmoji}</Text>
      </View>

      <View style={styles.infoBoxSection}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: isDarkMode ? "#bbb" : "#222" }]}>
            Name
          </Text>
          <Text
            style={[
              styles.infoDetails,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
          >
            {user?.displayName || "Guest"}
          </Text>
        </View>

        {user && (
          <View style={styles.row}>
            <Text
              style={[styles.label, { color: isDarkMode ? "#bbb" : "#222" }]}
            >
              Email
            </Text>
            <Text
              style={[
                styles.infoDetails,
                { color: isDarkMode ? "#fff" : "#000" },
              ]}
            >
              {user.email}
            </Text>
          </View>
        )}

        <View style={[styles.row, styles.toggleRow]}>
          <Text
            style={[styles.label, { color: isDarkMode ? "#bbb" : "#222" }]}
          >
            🌓 Dark Mode / Light Mode
          </Text>
          <Switch value={isDarkMode} onValueChange={toggleMode} />
        </View>
      </View>

      {user ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupText}>📝 Sign Up</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    alignSelf: "center",
  },
  emojiWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
  },
  infoBoxSection: {
    gap: 20,
  },
  row: {
    flexDirection: "column",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  infoDetails: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#C4849D",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    alignSelf: "center",
    backgroundColor: "#6a5acd",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 30,
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfilePage;
