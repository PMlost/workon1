const User = require("../models/userModel");
const Product = require("../models/adminProductModel");

//loadingCart
const cart = async (req, res) => {
  try {
    const userSession = req.session.user;

    const userCartItems = req.session.userCartItems || [];
    const userId = req.session.user.id;
    const userCompleteData = await User.findById(userId).populate(
      "cart.item.productId"
    );

    // console.log(userCompleteData.cart.item);

    if (!userCompleteData) {
      console.log("User not found");
    }

    res.render("user/cart.ejs", {
      userData: userCompleteData.cart.item,
      userComplete: userCompleteData,
      userCartItems,
      userSession,
    });
  } catch (error) {
    console.error(error.message);
    // Handle other errors
    res.status(500).send("Internal Server Error");
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;

    //findind user based on the id
    const user = await User.findById(userId);

    const product = await Product.findById(productId);

    if (!user || !product) {
      console.log("not found");
    }

    //product obj inside array
    const isExistingItem = user.cart.item.find((prodObj) =>
      prodObj.productId.equals(product._id)
    );

    if (isExistingItem) {
      isExistingItem.quantity += 1;
    } else {
      user.cart.item.push({
        productId: product._id,
        quantity: 1,
        price: product.price,
      });
    }
    user.cart.totalPrice = user.cart.totalPrice + product.price;
    await user.save();

    req.session.userCartItems = user.cart.item;

    const totalQuantity = cartView(user.cart.item);

    if (!req.session || !req.session.user) {
      return res.json({ success: false, message: "User is not logged in" });
    }

    return res.json({ success: true, totalQuantity });
  } catch (error) {
    console.log(error.message);
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;
    const plusOrMinus = req.body.plusOrMinus;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    const productObj = user.cart.item.find((prodObj) =>
      prodObj.productId.equals(productId)
    );

    if (!productObj) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (plusOrMinus === "increment") {
      productObj.quantity += 1;
      user.cart.totalPrice += product.price;
    } else if (plusOrMinus === "decrement") {
      productObj.quantity -= 1;
      user.cart.totalPrice -= product.price;
    }

    const grandTotal = user.cart.totalPrice;

    await user.save();
    req.session.userCartItems = user.cart.item;

    const updatedQuantity = productObj.quantity;
    const totalQuantity = cartView(user.cart.item);
    const totalPrice = updatedQuantity * productObj.price;

    const stock = product.stock;

    return res.json({
      success: true,
      updatedQuantity,
      totalQuantity,
      totalPrice,
      grandTotal,
      stock,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = req.body.productId;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    const productObjIndex = user.cart.item.findIndex((prodObj) => {
      return prodObj.productId.equals(productId);
    });
    // ..................
    if (productObjIndex !== -1) {
      const removedProduct = user.cart.item.splice(productObjIndex, 1)[0];

      user.cart.totalPrice -= removedProduct.price * removedProduct.quantity;

      await user.save();
    } else {
      console.log("Product not found in the cart");
    }
    req.session.userCartItems = user.cart.item;

    const totalQuantity = cartView(user.cart.item);
    const grandTotal = user.cart.totalPrice;

    res.json({ success: true, totalQuantity, grandTotal });
  } catch (error) {
    console.error(error.message);
  }
};

const cartView = (cartItems) => {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = {
  addToCart,
  cart,
  updateCart,
  deleteCart,
};
