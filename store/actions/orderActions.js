import Order from "../../models/order";

export const ADD_ORDER = "ADD_ORDER";
export const SET_ORDERS = "SET_ORDERS";

export const fetchOrders = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      // GET request by default
      const response = await fetch(
        `https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/orders/${userId}.json`
      );

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      // Returns objects of 'key' their FireBase id and 'value' an object with the Product fields
      const responseData = await response.json();
      const loadedOrders = [];

      for (const key in responseData) {
        loadedOrders.push(
          new Order(
            key,
            responseData[key].cartItems,
            responseData[key].totalAmount,
            new Date(responseData[key].date)
          )
        );
      }
      dispatch({ type: SET_ORDERS, orders: loadedOrders });
    } catch (error) {
      throw error;
    }
  };
};

export const addOrder = (cartItems, totalAmount) => {
  return async (dispatch, getState) => {
    // Get Auth token from Firebase which is stored after user logs in
    const token = getState().auth.token;
    const userId = getState().auth.userId;

    const currentDate = new Date();
    const response = await fetch(
      `https://rn-shop-app-3cfb4-default-rtdb.europe-west1.firebasedatabase.app/orders/${userId}.json?auth=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          totalAmount,
          date: currentDate.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong.");
    }

    // Returns an object with the key 'name'
    const responseData = await response.json();

    dispatch({
      type: ADD_ORDER,
      orderData: {
        id: responseData.name,
        items: cartItems,
        amount: totalAmount,
        date: currentDate,
      },
    });

    for (const cartItem of cartItems) {
      const pushToken = cartItem.productPushToken;

      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          to: pushToken,
          title: "Order was placed!",
          body: cartItem.productTitle,
        }),
      });
    }
  };
};
