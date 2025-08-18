const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const { payment, user, contribution } = require("../../models");
const { Op } = require("sequelize");
const withCreatorUpdaterNames = require("../middleware/responseFormatter")(
  user
);

// Find payment by all fields can 1 field or more
router.get("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    // Build the where clause dynamically based on provided query params
    const whereClause = {};

    // List of fields to search on
    const searchableFields = [
      "paymentUUID",
      "contributionId",
      "paymentAmount",
      "method",
      "paymentDate",
      "description",
    ];

    // Add each provided search parameter to the where clause
    searchableFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        whereClause[field] = {
          [Op.like]: `%${req.query[field]}%`,
        };
      }
    });

    const payments = await payment.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // Get contribution data
        const contributionData = await contribution.findByPk(
          payment.contributionId
        );

        return {
          ...payment.dataValues,
          contribution: contributionData,
          contributionName: contributionData.contributionName,
        };
      })
    );

    res.json(enrichedPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get One payment using paymentUUID
router.get("/:paymentUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const paymentData = await payment.findOne({
      where: { paymentUUID: req.params.paymentUUID },
    });
    res.json(paymentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a payment (hanya untuk admin)
router.post("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { contributionId, paymentAmount, method, paymentDate, description } =
      req.body;
    const paymentData = await payment.create({
      contributionId,
      paymentAmount,
      method,
      paymentDate,
      description,
      paymentUUID: uuidv4(),
      createdBy: req.user.id, // Set createdBy to the ID of the logged-in user
      updatedBy: req.user.id, // Also set updatedBy for the initial creation
    });

    res.status(201).json(paymentData);
  } catch (err) {
    // Handle duplicate email etc.
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update a payment (hanya untuk admin)
router.put("/:paymentUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const { contributionId, paymentAmount, method, paymentDate, description } =
      req.body;
    const paymentData = await payment.update(
      {
        contributionId,
        paymentAmount,
        method,
        paymentDate,
        description,
        updatedBy: req.user.id, // Set updatedBy to the ID of the logged-in user
      },
      {
        where: { paymentUUID: req.params.paymentUUID },
      }
    );

    if (!paymentData) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Fetch the updated payment data
    const updatedPayment = await payment.findOne({
      where: { paymentUUID: req.params.paymentUUID },
    });

    res.json(updatedPayment);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a payment (hanya untuk admin)
router.delete("/:paymentUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const deleted = await payment.destroy({
      where: { paymentUUID: req.params.paymentUUID },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
