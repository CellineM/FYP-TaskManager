import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// DO NOT PUSH THIS TO GITHUB, only add it to .gitignore 

const firebaseConfig = {
  apiKey: "AIzaSyDOPXJFbRKD9EcKgUNuZoqtZ1--XxDJ6rg",
  authDomain: "taskmanager-c668b.firebaseapp.com",
  projectId: "taskmanager-c668b",
  storageBucket: "taskmanager-c668b.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:48699675668:android:f722faad3f510b1c0c8301"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

export { app, auth, db };
