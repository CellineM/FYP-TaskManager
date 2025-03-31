import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

const StartPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>TaskTastik</Text>
      <Text style={styles.subtitle}>Level Up Your Life with TaskTastik!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.guestModeButton]}
        onPress={() => navigation.navigate("MainPage")}
      >
        <Text style={styles.buttonText}>Guest Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C1B47", // dark purple 
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff", // white colour
    marginBottom: 40,
  },

  // slogan
  subtitle: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 20,
    marginTop: -20,
  },

  button: {
    backgroundColor: "#9356A0",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    width: "70%",
    alignItems: "center",
    borderColor: "#DCCAE9",
    borderWidth: 1,
  },
  guestModeButton: {
    backgroundColor: "#4C5D8B", // muted blue colour for guest button
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default StartPage;
