const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const userData = req.body;

    const result = await authService.registerUser(userData);

    res.status(201).json({
      message: "User registered successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }

    if (error.message === "Invalid password") {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(500).json({ message: "Login error", error: error.message });
  }
};

exports.verifyToken = (req, res) => {
  // Le middleware checkAuth a déjà vérifié le token et ajouté req.user
  res.status(200).json({
    valid: true,
    user: req.user,
  });
};
