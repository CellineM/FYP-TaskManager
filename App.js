import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import StartPage from "./screens/Startpage";
import SignupPage from "./screens/SignupPage";
import LoginPage from "./screens/LoginPage";

//import MainPage from "./screens/MainPage";
import BottomTabNavigation from "./components/BottomTabNavigation"

// task list
import TaskList from "./screens/TaskList";
import CreateTaskList from "./screens/CreateTaskList";
import EditTaskList from "./screens/EditTaskList";

// note list
import NoteList from "./screens/NoteList";
import CreateNoteList from "./screens/CreateNoteList";
import EditNoteList from "./screens/EditNoteList";

// games
import Game1 from "./screens/Game1";
import Game2 from "./screens/Game2";
import Game3 from "./screens/Game3";

// reward page
import RewardPage from './screens/RewardPage';

// mode - light/dark
import { ThemeMode } from './background/modeTheme';

const Stack = createStackNavigator();


export default function App() {
  return (
    <ThemeMode>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupPage} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>

        <Stack.Screen name="MainPage" component={BottomTabNavigation} options={{ headerShown: false }} />

        <Stack.Screen name="TaskList" component={TaskList} options={{ headerShown: false }}/>
        <Stack.Screen name="CreateTaskList" component={CreateTaskList} options={{ headerShown: false }}/>
        <Stack.Screen name="EditTaskList" component={EditTaskList} options={{ headerShown: false }}/>

        <Stack.Screen name="NoteList" component={NoteList} options={{ headerShown: false }}/>
        <Stack.Screen name="CreateNoteList" component={CreateNoteList} options={{ headerShown: false }}/>
        <Stack.Screen name="EditNoteList" component={EditNoteList} options={{ headerShown: false }}/>

        <Stack.Screen name="RewardPage" component={RewardPage} options={{ headerShown: false }}/>

        <Stack.Screen name="Game1" component={Game1} options={{ headerShown: false }}/>
        <Stack.Screen name="Game2" component={Game2} options={{ headerShown: false }}/>
        <Stack.Screen name="Game3" component={Game3} options={{ headerShown: false }}/>
        


      </Stack.Navigator>
    </NavigationContainer>
    </ThemeMode>
  );
}