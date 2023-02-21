import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useReducer,
  useEffect,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../constants/Colors";
import Input from "../../components/UI/Input";
import HeaderButton from "../../components/UI/HeaderButton";
import * as productsActions from "../../store/actions/productsActions";

const FORM_INPUT_UPDATE = "UPDATE";

// Not related to redux
const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      // Update the correct field with the new text written by the user
      [action.inputField]: action.value,
    };

    const updatedValidities = {
      ...state.inputValidities,
      // Update the correct field with the correct isValid boolean
      [action.inputField]: action.isValid,
    };

    let updatedFormIsValid = true;
    // Loop through the form and check the validity of every field
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }

    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid,
    };
  }

  return state;
};

function EditProductScreen({ route, navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // Get 'productId' param from existing params
  // Will be set to 'undefined' if it doesn't exist
  const { productId } = route.params;

  // Only want if we're 'Editing' a product
  // Will also be set to undefined if it doesn't find one
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((prod) => prod.id === productId)
  );

  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    // Initial values
    inputValues: {
      title: editedProduct ? editedProduct.title : "",
      imageUrl: editedProduct ? editedProduct.imageUrl : "",
      description: editedProduct ? editedProduct.description : "",
      price: "",
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  });

  useEffect(() => {
    if (error) {
      Alert.alert("An error ocurred.", error, [{ text: "Okay" }]);
    }
  }, [error]);

  // --- Don't need this after switching to a Reducer approach
  // const [title, setTitle] = useState(editedProduct ? editedProduct.title : "");
  // const [titleIsValid, setTitleIsValid] = useState(false);
  // const [imageUrl, setImageUrl] = useState(
  //   editedProduct ? editedProduct.imageUrl : ""
  // );
  // const [price, setPrice] = useState("");
  // const [description, setDescription] = useState(
  //   editedProduct ? editedProduct.description : ""
  // );

  // #region --------------------------- Handlers ---------------------------

  const submitHandler = useCallback(async () => {
    // If editing a product
    if (!formState.formIsValid) {
      Alert.alert("Wrong input!", "Please check the errors in the form.", [
        { text: "Okay" },
      ]);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      if (editedProduct) {
        await dispatch(
          productsActions.updateProduct(
            productId,
            formState.inputValues.title,
            formState.inputValues.description.trim(),
            formState.inputValues.imageUrl
          )
        );
      } else {
        // If adding a product
        await dispatch(
          productsActions.createProduct(
            formState.inputValues.title,
            formState.inputValues.description.trim(),
            formState.inputValues.imageUrl,
            +formState.inputValues.price
          )
        );
      }

      navigation.goBack();
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  }, [dispatch, productId, formState]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        // This inputField should be a key inside the reducer
        inputField: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  // #endregion -------------------------------------------------------------

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: productId ? "Edit Product" : "Add Product",
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
          <Item title="Save" iconName="md-checkmark" onPress={submitHandler} />
        </HeaderButtons>
      ),
    });
  }, [navigation, submitHandler]);

  if (isLoading) {
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>;
  }

  return (
    // flex:1 is mandatory in KeyboardAvoidingView
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={50}
    >
      <ScrollView>
        <View style={styles.form}>
          {/* {!!editedProduct} returns true if it exists */}
          <Input
            id="title"
            label={"Title"}
            errorText="Please enter a valid title!"
            autoCapitalize="sentences"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ""}
            initiallyValid={!!editedProduct}
            required
          />
          <Input
            id="imageUrl"
            label={"Image Url"}
            errorText="Please enter a valid image url!"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imageUrl : ""}
            initiallyValid={!!editedProduct}
            required
          />
          {editedProduct ? null : (
            <Input
              id="price"
              label={"Price"}
              errorText="Please enter a valid price!"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              required
              min={0.1}
            />
          )}
          <Input
            id="description"
            label={"Description"}
            errorText="Please enter a valid description!"
            autoCapitalize="sentences"
            onInputChange={inputChangeHandler}
            multiline
            numberOfLines={3}
            initialValue={editedProduct ? editedProduct.description : ""}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditProductScreen;
