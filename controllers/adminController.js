const adminProductModel = require("../models/adminProductModel");
const User = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const bcrypt = require("bcrypt");

const adminLogin = async (req, res) => {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;

  try {
    const adminSession = req.session.admin;

    if (req.session.admin) {
      res.redirect("/admin/view-product");
    } else {
      res.render("admin/signIn.ejs", { errorMessage, sidebar: false });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email: email });

    if (!admin) {
      return res.redirect("/admin/login");
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      req.session.errorMessage = "Invalid email or password";
      return res.redirect("/admin/login");
    }

    if (admin.isAdmin === false) {
      req.session.errorMessage = "You are not a Authorised Person ";
      return res.redirect("/admin/login");
    } else {
      const adminSession = (req.session.admin = {
        id: admin._id,
        email: admin.email,
      });

      res.redirect("/admin/view-product");
    }

    // Passwords match, and admin is true  set user session
  } catch (error) {
    console.error(error);
    // res.redirect("/login");
  }
};

// /dashboard-loaddashboard

const loadDashboard = async (req, res) => {
  try {
    res.render("admin/dashboard.ejs");
  } catch (error) {
    console.log(error);
  }
};

const loadCustomer = async (req, res) => {
  try {
    const allCustomers = await User.find({ isAdmin: false }).sort({ name: -1 });

    res.render("admin/customer.ejs", { allCustomers });
  } catch (error) {
    console.log(error);
  }
};

//block-customer
const blockCustomer = async (req, res) => {
  const userId = req.params.id;

  try {
    const userData = await User.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).send("User not found");
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { isBlocked: !userData.isBlocked }
    );

    // console.log(userData);
    // if (userData.isBlocked === 0) {
    //   await User.findOneAndUpdate({ _id: userId }, { isBlocked: 1 });
    //   req.session.user = null;
    // } else {
    //   await User.findOneAndUpdate({ _id: userId }, { isBlocked: 0 });
    //   console.log("unblock");
    // }
    res.redirect("/admin/customer");
  } catch (error) {
    res.status(404).send("error");
    console.error("Error in blockCustomer:", error.message);
    console.log(error);
  }
};

//category
const categorySection = async (req, res, next) => {
  try {
    const categoryDetails = await categoryModel.find();

    res.render("admin/categorySection.ejs", { categoryDetails });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render("admin/addCategory", { categoryMessage: errorMessage });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategoryPost = async (req, res) => {
  try {
    const categoryName = await categoryModel.findOne({
      name: req.body.categoryName,
    });
    if (categoryName) {
      req.session.errorMessage = "Category Name already Exist";
      return res.redirect("/admin/add-category");
    }
    const addNewCategory = new categoryModel({ name: req.body.categoryName });
    addNewCategory.save();
    return res.redirect("/admin/add-category");
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
  try {
    const catId = req.query.id;

    const categoryData = await categoryModel.findOne({ _id: catId });

    res.render("admin/editCategory.ejs", { categoryDetail: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const updateCategory = async (req, res) => {
  const catId = req.params.id;
  try {
    const categoryFind = await categoryModel.findOne({
      name: req.body.categoryName,
    });

    if (categoryFind) {
      // const categoryDetail = await categoryModel.find();
      res.render("admin/editCategory.ejs", {
        categoryDetail: categoryFind,
        categoryMessage: "Category already existed",
      });
    } else {
      const categoryUpdated = await categoryModel.updateOne(
        { _id: catId },
        { $set: { name: req.body.categoryName } }
      );
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }

  // const categoryData = await categoryModel.findOne({ _id: catId });

  // res.render("admin/editCategory.ejs", { categoryDetail: categoryData });
};

const unlistCategory = async (req, res) => {
  try {
    const catId = req.query.id;
    const categoryData = await categoryModel.findOne({ _id: catId });
    // console.log(categoryData);
    if (!categoryData) {
      return res.status(404).send("not found");
    }

    const c = await categoryModel.findOneAndUpdate(
      { _id: catId },
      { isAvailable: !categoryData.isAvailable }
    );

    res.redirect("/admin/category");
  } catch (error) {}
};

//logout admin
const logoutAdmin = async (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/login");
};

const orderManagement = async (req, res, next) => {
  try {
    const ordersArray = await orderModel
      .find({})
      .populate("userId")
      .sort({ createdAt: -1 });
    // console.log(ordersArray);
    res.render("admin/orderManagement.ejs", { ordersArray });
  } catch (error) {
    console.log(error.message);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;
    // console.log(status);

    const orderDetails = await orderModel.findByIdAndUpdate(
      { _id: orderId },
      { $set: { status } }
    );

    if (orderDetails) {
      res.redirect("/admin/load-order");
    }
  } catch (error) {
    console.log(error.message);
  }

  // console.log(orderDetails);
};

const viewOrderDetails = async (req, res, next) => {
  try {
    const id = req.query.id;
    const order = await orderModel.findById({ _id: id });
    // console.log(order);
    const orderDetail = await order.populate("products.item.productId");
    // console.log(orderDetails);
    res.render("admin/viewOrderDetails.ejs", { orderDetail });
  } catch (error) {
    next(error);
  }
};

const salesOrder = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;

    const orders = await orderModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: -1 })
      .populate("userId");

    // console.log(orders);
    res.send({ orderDetail: orders });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  // editProduct,
  // updateProduct,
  verifyLogin,
  logoutAdmin,
  loadDashboard,
  loadCustomer,
  blockCustomer,
  categorySection,
  addCategory,
  addCategoryPost,
  editCategory,
  updateCategory,
  unlistCategory,
  orderManagement,
  updateStatus,
  viewOrderDetails,
  salesOrder,
};
