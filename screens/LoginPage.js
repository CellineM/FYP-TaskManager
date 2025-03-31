import React, { useState } from "react";
import {View,Text,TextInput,Button,StyleSheet,TouchableOpacity,} from "react-native";

import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Ionicons } from "@expo/vector-icons"; // Make sure expo/vector-icons is installed

const LoginPage = ({ navigation }) => {
  const [email, isEmail] = useState("");
  const [password, isPassword] = useState("");

  const manageLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Successfully logged in!");
      navigation.replace("MainPage");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={isEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={isPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={manageLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C1B47",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  returnButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#3D2C5D",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5A4E7B",
    color: "#fff",
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#9356A0",
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoginPage;
