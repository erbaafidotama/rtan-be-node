const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { user } = require("../../models");

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await user.findOne({ where: { email } });
    if (!userData) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", userData, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
