import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { useMode } from "../background/modeTheme";

// Screens
import MainPage from "../screens/MainPage";
import GamePage from "../screens/GamePage";
import RewardPage from "../screens/RewardPage";
import ProfilePage from "../screens/ProfilePage";

// bottom tab navigator
const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {

  const { colors } = useMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Games":
              iconName = "game-controller-outline";
              break;
            case "Rewards":
              iconName = "trophy-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        // tabBarActiveTintColor: "#007AFF",
        // tabBarInactiveTintColor: "gray",
        // headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: "transparent",
        },
        // hide the top header
        headerShown: false,
      })}
    >
      {/* Define tab screens */}
      <Tab.Screen name="Home" component={MainPage} />
      <Tab.Screen name="Games" component={GamePage} />
      <Tab.Screen name="Rewards" component={RewardPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
