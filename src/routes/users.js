const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { user } = require("../../models");
const { authenticateToken } = require("../middleware/auth");
const withCreatorUpdaterNames = require("../middleware/responseFormatter")(
  user
);

// Create a user
router.post("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { firstName, lastName, email, password, residentId } = req.body;
    const passwordHashed = await bcrypt.hash(password, 12);

    const userData = await user.create({
      firstName,
      lastName,
      email,
      password: passwordHashed,
      userUUID: uuidv4(),
      residentId,
      createdBy: req.user.id, // Set createdBy to the ID of the logged-in user
      updatedBy: req.user.id, // Also set updatedBy for the initial creation
    });

    res.status(201).json(userData);
  } catch (err) {
    // Handle duplicate email etc.
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update a user
router.put("/:userUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { firstName, lastName, email, password, residentId } = req.body;

    // Prepare update data
    const updateData = {
      firstName,
      lastName,
      email,
      residentId,
      updatedBy: req.user.id, // Set updatedBy to the ID of the logged-in user
    };

    // Only hash and update password if it's provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const [updated] = await user.update(updateData, {
      where: { userUUID: req.params.userUUID },
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the updated user data
    const updatedUser = await user.findOne({
      where: { userUUID: req.params.userUUID },
    });

    res.json(updatedUser);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error updating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get current user profile
router.get("/me", withCreatorUpdaterNames, async (req, res) => {
  try {
    const userData = await user.findByPk(req.user.id, {
      // attributes: { exclude: ["password"] }, // Jangan sertakan password
      include: [
        {
          model: user.sequelize.models.resident,
          as: "resident",
          required: false,
        },
      ],
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List users (hanya untuk admin)
router.get("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const users = await user.findAll({
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] }, // Jangan sertakan password
      include: [
        {
          model: user.sequelize.models.resident,
          as: "resident",
          required: false,
        },
      ],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
