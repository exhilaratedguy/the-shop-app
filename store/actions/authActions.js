import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";
export const SET_DID_TRY_AUTO_LOGIN = "SET_DID_TRY_AUTO_LOGIN";

let timer;

export const setDidTryAutoLogin = () => {
  return { type: SET_DID_TRY_AUTO_LOGIN };
};

export const authenticate = (userId, token, expiryTime) => {
  return (dispatch) => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({
      type: AUTHENTICATE,
      userId: userId,
      token: token,
    });
  };
};

export const signup = (email, password) => {
  // Redux thunk middleware
  return async (dispatch) => {
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD9MgSW-UIBCWSKV3Sgq_ori0P1CJe5JBc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorId = errorData.error.message;

      let errorMessage = "Something went wrong with the authentication.";
      if (errorId === "EMAIL_EXISTS") {
        errorMessage = "This email already exists.";
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    dispatch(
      authenticate(
        responseData.localId,
        responseData.idToken,
        parseInt(responseData.expiresIn) * 1000
      )
    );

    // Get the current time in miliseconds and add the expiration timer to it
    // expiresIn is in seconds and also a string
    const expirationDate = new Date(
      new Date().getTime() + parseInt(responseData.expiresIn) * 1000
    );
    saveDataToStorage(
      responseData.idToken,
      responseData.localId,
      expirationDate
    );
  };
};

export const login = (email, password) => {
  // Redux thunk middleware
  return async (dispatch) => {
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD9MgSW-UIBCWSKV3Sgq_ori0P1CJe5JBc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorId = errorData.error.message;

      let errorMessage = "Something went wrong with the authentication.";
      if (errorId === "EMAIL_NOT_FOUND") {
        errorMessage = "This email could not be found.";
      } else if (errorId === "INVALID_PASSWORD") {
        errorMessage = "This password is not valid.";
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    dispatch(
      authenticate(
        responseData.localId,
        responseData.idToken,
        parseInt(responseData.expiresIn) * 1000
      )
    );

    // Get the current time in miliseconds and add the expiration timer to it
    // expiresIn is in seconds and also a string
    const expirationDate = new Date(
      new Date().getTime() + parseInt(responseData.expiresIn) * 1000
    );
    saveDataToStorage(
      responseData.idToken,
      responseData.localId,
      expirationDate
    );
  };
};

export const logout = () => {
  clearLogoutTimer();
  // removeItem() returns a Promise but we can just return right away and trust
  // that it will complete, it doesn't matter if we swap screens before it does
  AsyncStorage.removeItem("userData");
  return { type: LOGOUT };
};

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};

// A function to run logout() after a certain amount of time
// expirationTime in miliseconds (ms)
const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

function saveDataToStorage(token, userId, expirationDate) {
  // Save to the device with key 'userData' and value a JSON in a string format
  // setItem() only takes values: string
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token: token,
      userId: userId,
      // Save the expiry date as a string
      expiryDate: expirationDate.toISOString(),
    })
  );
}
