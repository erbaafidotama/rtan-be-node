const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const { contribution, user } = require("../../models");
const { Op } = require("sequelize");
const withCreatorUpdaterNames = require("../middleware/responseFormatter")(
  user
);

// Find contribution by all fields can 1 field or more
router.get("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    // Build the where clause dynamically based on provided query params
    const whereClause = {};

    // List of fields to search on
    const searchableFields = [
      "contributionName",
      "amount",
      "description",
      "active",
    ];

    // Add each provided search parameter to the where clause
    searchableFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        whereClause[field] = {
          [Op.iLike]: `%${req.query[field]}%`,
        };
      }
    });

    const contributions = await contribution.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get One contribution using contributionUUID
router.get("/:contributionUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const contributionData = await contribution.findOne({
      where: { contributionUUID: req.params.contributionUUID },
    });
    res.json(contributionData);
  } catch (error) {
    console.error("Get contribution error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a contribution (hanya untuk admin)
router.post("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { contributionName, amount, description, active } = req.body;
    const flagActive = active ? active : true;
    const contributionData = await contribution.create({
      contributionName,
      amount,
      description,
      active: flagActive,
      contributionUUID: uuidv4(),
      createdBy: req.user.id, // Set createdBy to the ID of the logged-in user
      updatedBy: req.user.id, // Also set updatedBy for the initial creation
    });

    res.status(201).json(contributionData);
  } catch (err) {
    // Handle duplicate email etc.
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update a contribution (hanya untuk admin)
router.put("/:contributionUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { contributionName, amount, description, active } = req.body;
    const contributionData = await contribution.update(
      {
        contributionName,
        amount,
        description,
        active,
        updatedBy: req.user.id, // Set updatedBy to the ID of the logged-in user
      },
      {
        where: { contributionUUID: req.params.contributionUUID },
      }
    );

    if (!contributionData) {
      return res.status(404).json({ error: "Contribution not found" });
    }

    // Fetch the updated contribution data
    const updatedContribution = await contribution.findOne({
      where: { contributionUUID: req.params.contributionUUID },
    });

    res.json(updatedContribution);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a contribution (hanya untuk admin)
router.delete("/:contributionUUID", async (req, res) => {
  try {
    const deleted = await contribution.destroy({
      where: { contributionUUID: req.params.contributionUUID },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Contribution not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
