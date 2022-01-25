import React, { useLayoutEffect } from "react";
import { FlatList, Text } from "react-native";
import { useSelector } from "react-redux";

function OrdersScreen({ navigation }) {
  // state.<identifier in root reducer> which has an orders array
  const orders = useSelector((state) => state.orders.orders);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Your Orders",
    });
  }, [navigation]);

  return (
    <FlatList
      data={orders}
      renderItem={(itemData) => <Text>{itemData.item.totalAmount}</Text>}
    />
  );
};

export default OrdersScreen;
