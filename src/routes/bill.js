const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const { bill, resident, contribution, user, payment } = require("../../models");
const { Op } = require("sequelize");
const withCreatorUpdaterNames = require("../middleware/responseFormatter")(
  user
);

// Find bill by all fields can 1 field or more
router.get("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    // Build the where clause dynamically based on provided query params
    const whereClause = {};

    // List of fields to search on
    const searchableFields = [
      "residentId",
      "contributionId",
      "period",
      "status",
      "paymentFinishDate",
      "description",
    ];

    // Add each provided search parameter to the where clause
    searchableFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        if (field === "contributionId") {
          whereClause[field] = parseInt(req.query[field]);
        } else {
          whereClause[field] = {
            [Op.like]: `%${req.query[field]}%`,
          };
        }
      }
    });

    const bills = await bill.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    const enrichedBills = await Promise.all(
      bills.map(async (bill) => {
        // Get resident data
        const residentData = await resident.findByPk(bill.residentId);
        // Get contribution data
        const contributionData = await contribution.findByPk(
          bill.contributionId
        );
        // get payment data
        const paymentData = await payment.findAll({
          where: { billId: bill.id },
        });

        return {
          ...bill.dataValues,
          resident: residentData,
          contribution: contributionData,
          residentName: residentData.firstName + " " + residentData.lastName,
          contributionName: contributionData.contributionName,
          contributionAmount: contributionData.amount,
          paymentData: paymentData,
          unpaymentAmount:
            contributionData.amount -
            paymentData.reduce(
              (total, payment) => total + parseFloat(payment.paymentAmount),
              0
            ),
        };
      })
    );
    res.json(enrichedBills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get One bill using billUUID
router.get("/:billUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const billData = await bill.findOne({
      where: { billUUID: req.params.billUUID },
    });
    res.json(billData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a bill (hanya untuk admin)
router.post("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const {
      residentId,
      contributionId,
      period,
      status,
      paymentFinishDate,
      description,
    } = req.body;

    const billData = await bill.findAll({
      where: { residentId, contributionId, period },
    });
    console.log("billData", billData);
    if (billData.length > 0) {
      return res
        .status(404)
        .json({ error: "Bills for Resident and Contribution already exists" });
    } else {
      // const billData = await bill.create({
      //   residentId,
      //   contributionId,
      //   period,
      //   status,
      //   paymentFinishDate: paymentFinishDate
      //     ? new Date(paymentFinishDate)
      //     : null,
      //   description,
      //   billUUID: uuidv4(),
      //   createdBy: req.user.id, // Set createdBy to the ID of the logged-in user
      //   updatedBy: req.user.id, // Also set updatedBy for the initial creation
      // });
      // res.status(201).json(billData);
    }
  } catch (err) {
    // Handle duplicate email etc.
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(400).json({ error: err.message });
  }
});

// Update a bill (hanya untuk admin)
router.put("/:billUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const {
      residentId,
      contributionId,
      period,
      status,
      paymentFinishDate,
      description,
    } = req.body;
    const [updated] = await bill.update(
      {
        residentId,
        contributionId,
        period,
        status,
        paymentFinishDate,
        description,
        updatedBy: req.user.id, // Set updatedBy to the ID of the logged-in user
      },
      {
        where: { billUUID: req.params.billUUID },
      }
    );

    if (!updated) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Fetch the updated bill data
    const updatedBill = await bill.findOne({
      where: { billUUID: req.params.billUUID },
    });

    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a bill (hanya untuk admin)
router.delete("/:billUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const deleted = await bill.destroy({
      where: { billUUID: req.params.billUUID },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
