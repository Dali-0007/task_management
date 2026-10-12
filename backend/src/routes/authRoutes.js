
const express = require("express");
const {
  signUp,
  signIn,
  getCurrentUser,
  signOut,
} = require("../controllers/authController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/me", authenticateUser, getCurrentUser);
router.post("/sign-out", signOut);

module.exports = router;
