import PRODUCTS from "../../data/dummy-data";

const initialState = {
  availableProducts: PRODUCTS,

  // Filter the products array to find the ones owned by this owner
  userProducts: PRODUCTS.filter(prod => prod.ownerId === 'u1'),
};

export default (state = initialState, action) => {
  return state;
};
