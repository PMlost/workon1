const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const wishListController = require("../controllers/wishlistController");
const auth = require("../middlewares/userSession");
const checkBlocked = require("../middlewares/checkBlocked");

// router.get("/", auth.isLogin, userController.landingPage);
router.get("/", userController.homePage);

router.get("/signup", userController.signUpUser);
router.post("/signup", userController.signUpUserPost);

router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOTP);

router.post("/login", userController.loginUserPost);
router.get("/login", auth.isLogout, userController.loginUser);
router.get("/logout", auth.isLogin, userController.logoutUser);

// ..login check
router.get("/home", auth.isLogin, userController.homePage);

router.get("/shop", userController.shop);
router.get("/view-product", userController.viewUserProduct);

//cart section............
// ?? isLogin needed for /addtocart
router.use(auth.isLogin);
router.use(checkBlocked);
router.get("/cart", cartController.cart);
router.post("/addToCart", cartController.addToCart);

router.post("/updateCart", cartController.updateCart);
router.post("/deleteCart", cartController.deleteCart);

router.get("/profile", userController.profile);
router.get("/edit-profile", userController.editProfile);
router.post("/edit-profile", userController.updateProfile);

router.get("/manageAddress", userController.manageAddress);
router.post("/addAddress", userController.addAddress);
router.get("/viewAddress", userController.viewAddress);
router.get("/editAddress", userController.editAddress);
router.post("/editAddress", userController.editUpdateAddress);
router.get("/deleteAddress", userController.deleteAddress);
router.get("/selectedAddress", userController.selectedAddress);

router.get("/change-password", userController.changePassword);
router.post("/change-password", userController.updatePassword);
//checkout
router.get("/checkout", userController.checkout);
router.post("/placeOrder", userController.placeOrder);
router.post("/onlinePayment", userController.onlinePayment);

//order

router.get("/order-details", userController.orderDetails); //box
router.get("/fullOrderDetails", userController.viewOrderDetails); //fullpage
router.get("/cancel-order", userController.cancelOrder);

// wishlist
router.get("/wishlist", wishListController.viewWishList);
router.post("/add-wishlist", wishListController.addWishList);
router.post("/remove-from-wishlist", wishListController.removeFromWishlist);

//coupon
router.post("/applyCoupon", userController.applyCoupon);

module.exports = router;
