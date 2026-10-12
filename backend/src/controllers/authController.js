
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../services/authService");

const COOKIE_NAME = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (!name.trim() || !email.trim() || password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a name, valid email, and password of at least 8 characters.",
      });
    }

    const user = await registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Sign-up failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await loginUser({ email, password });

    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      }
    );

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      user,
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    console.error("Sign-in failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in. Please try again.",
    });
  }
}

function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

function signOut(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Signed out successfully.",
  });
}

module.exports = {
  signUp,
  signIn,
  getCurrentUser,
  signOut,
};
