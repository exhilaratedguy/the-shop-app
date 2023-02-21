import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

import * as authActions from "../store/actions/authActions";
import Colors from "../constants/Colors";

function StartupScreen({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const tryLogin = async () => {
      // getItem() returns a string
      const userData = await AsyncStorage.getItem("userData");

      // If userData/token doesn't exist, go to Login/Sign up page
      if (!userData) {
        // navigation.navigate("AuthNav");
        dispatch(authActions.setDidTryAutoLogin());
        return;
      }

      // Parse the data to a JSON object
      const transformedData = JSON.parse(userData);
      const { token, userId, expiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);

      // If past the expiration date || token doesnt exist || userId doesnt exist
      if (expirationDate <= new Date() || !token || !userId) {
        // navigation.navigate("AuthNav");
        dispatch(authActions.setDidTryAutoLogin());
        return;
      }

      // Get time in ms of the expirationDate - time in ms of current Date
      const expirationTime = expirationDate.getTime() - new Date().getTime();

      //   navigation.navigate("Shop");
      dispatch(authActions.authenticate(userId, token, expirationTime));
    };

    tryLogin();
  }, [dispatch]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StartupScreen;
