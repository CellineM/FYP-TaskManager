import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";


const db = getFirestore();

const SignupPage = ({ navigation }) => {
  const [email, isEmail] = useState("");
  const [name, isName] = useState("");
  const [password, isPassword] = useState("");
  const [password2, isPassword2] = useState("");
  const [passwordStrong, isPasswordStrong] = useState({ text: "", progress: 0, color: "red" });

  const checkIfPasswordStrong = (input) => {
    let passwordStrength = { text: "Weak", progress: 0.33, color: "red" };

    if (input.length >= 8) {
      passwordStrength = { text: "Medium", progress: 0.66, color: "orange" };
    }

    if (
      input.length >= 10 &&
      /[A-Z]/.test(input) &&
      /[0-9]/.test(input) &&
      /[\W]/.test(input)
    ) {
      passwordStrength = { text: "Strong", progress: 1, color: "green" };
    }

    isPasswordStrong(passwordStrength);
  };

  const manageSignup = async () => {
    if (!email || !name || !password || !password2) {
      alert("Please fill in every single box!");
      return;
    }

    if (password !== password2) {
      alert("The passwords does not match, please try again!");
      return;
    }

    if (passwordStrong.text === "Weak") {
      alert("Please choose a stronger password");
      return;
    }

    try {
      const userDetails = await createUserWithEmailAndPassword(auth, email, password);
      const user = userDetails.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      alert("Account successfully created!");
      navigation.replace("MainPage");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>


      <Text style={styles.title}>Sign Up</Text>

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
        placeholder="Your Full Name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={isName}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={(text) => {
          isPassword(text);
          checkIfPasswordStrong(text);
        }}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.progressBar}>
        <Progress.Bar
          progress={passwordStrong.progress}
          width={300}
          color={passwordStrong.color}
        />
        <Text style={[styles.strengthText, { color: passwordStrong.color }]}>
          {passwordStrong.text}
        </Text>
      </View>

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        value={password2}
        onChangeText={isPassword2}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.signupButton} onPress={manageSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C1B47",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "#3E2D63",
    color: "#fff",
    padding: 12,
    borderRadius: 20,
    marginBottom: 18,
    fontSize: 16,
  },
  progressBar: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  strengthText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#9356A0",
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  returnButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 10,
  },
});

export default SignupPage;
