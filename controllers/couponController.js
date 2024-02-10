const couponModel = require("../models/couponModel");

const viewCoupon = async (req, res) => {
  try {
    const coupons = await couponModel.find();

    res.render("admin/viewCoupon", { coupons });
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    res.render("admin/addCoupon", { message: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const addNewCoupon = async (req, res) => {
  try {
    const isCouponExist = await couponModel.findOne({
      name: req.body.couponName,
    });
    if (isCouponExist) {
      res.render("admin/addCoupon", { message: "already exists" });
    } else {
      const newCoupon = new couponModel({
        name: req.body.couponName,
        discount: req.body.discount,
        minimumvalue: req.body.minValue,
        maximumvalue: req.body.maxValue,
        expiryDate: req.body.expiryDate,
      });
      newCoupon.save();
      res.redirect("/admin/view-coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  viewCoupon,
  addCoupon,
  addNewCoupon,
};
