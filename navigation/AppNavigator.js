import React from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

import { ShopNavigator, AuthNavigator } from "./ShopNavigator";
import StartupScreen from "../screens/StartupScreen";

function AppNavigator() {
  // In the 'auth' state, get token (check initialState for reference)
  // !! forces it to be true or false (exists or not)
  const isAuth = useSelector((state) => !!state.auth.token);
  const didTryAutoLogin = useSelector((state) => state.auth.didTryAutoLogin);

  return ( 
    <NavigationContainer>
        {isAuth && <ShopNavigator />}
        {!isAuth && didTryAutoLogin && <AuthNavigator />}
        {!isAuth && !didTryAutoLogin && <StartupScreen />}
    </NavigationContainer>
  );
}

export default AppNavigator;
