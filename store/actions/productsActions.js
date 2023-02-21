import Product from "../../models/product";
import * as Notifications from "expo-notifications";

export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const CREATE_PRODUCT = "CREATE_PRODUCT";
export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const SET_PRODUCTS = "SET_PRODUCTS";

export const fetchProducts = () => {
  return async (dispatch, getState) => {
    try {
      const userId = getState().auth.userId;
      // any async code you want in here (the redux store can only deal with synchronous code)
      // GET request by default
      const response = await fetch(
        "https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/products.json"
      );

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      // Returns objects of 'key' their FireBase id and 'value' an object with the Product fields
      const responseData = await response.json();
      const loadedProducts = [];

      for (const key in responseData) {
        loadedProducts.push(
          new Product(
            key,
            responseData[key].ownerId,
            responseData[key].ownerPushToken,
            responseData[key].title,
            responseData[key].imageUrl,
            responseData[key].description,
            responseData[key].price
          )
        );
      }

      dispatch({
        type: SET_PRODUCTS,
        products: loadedProducts,
        userProducts: loadedProducts.filter((prod) => prod.ownerId === userId),
      });
    } catch (error) {
      // Send to custom analytics server or something
      throw error;
    }
  };
};

export const deleteProduct = (productId) => {
  return async (dispatch, getState) => {
    // Get Auth token from Firebase which is stored after user logs in
    const token = getState().auth.token;
    const response = await fetch(
      `https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/products/${productId}.json?auth=${token}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong!");
    }

    dispatch({ type: DELETE_PRODUCT, pid: productId });
  };
};

export const createProduct = (title, description, imageUrl, price) => {
  // redux-thunk takes care of this
  return async (dispatch, getState) => {
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;

    // Get Auth token from Firebase which is stored after user logs in
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    // any async code you want in here (the redux store can only deal with synchronous code)
    const response = await fetch(
      `https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/products.json?auth=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          price,
          ownerId: userId,
          ownerPushToken: pushToken,
        }),
      }
    );

    // Returns an object with the key 'name'
    const responseData = await response.json();

    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: responseData.name,
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        pushToken: pushToken,
      },
    });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  // Redux thunk allows access to 'dispatch' and the current state of our
  // redux store with 'getState'
  return async (dispatch, getState) => {
    // Get Auth token from Firebase which is stored after user logs in
    const token = getState().auth.token;
    const response = await fetch(
      `https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/products/${id}.json?auth=${token}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong.");
    }

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      },
    });
  };
};
