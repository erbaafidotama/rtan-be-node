const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const { resident, user } = require("../../models");
const { Op } = require("sequelize");
const withCreatorUpdaterNames = require("../middleware/responseFormatter")(
  user
);

// Find resident by all fields can 1 field or more
// Example: GET /residents/search?firstName=John&lastName=Doe
// Example: GET /residents/search?noKK=12345
router.get("/search", withCreatorUpdaterNames, async (req, res) => {
  try {
    // Build the where clause dynamically based on provided query params
    const whereClause = {};

    // List of fields to search on
    const searchableFields = [
      "firstName",
      "lastName",
      "noKK",
      "noNIK",
      "noHouse",
      "dateIn",
      "dateOut",
      "active",
      "noKTP",
      "address",
      "phone",
    ];

    // Add each provided search parameter to the where clause
    searchableFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        whereClause[field] = {
          [Op.like]: `%${req.query[field]}%`,
        };
      }
    });

    const residents = await resident.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(residents);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a resident (hanya untuk admin)
router.post("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      noKK,
      noNIK,
      noHouse,
      dateIn,
      dateOut,
      noKTP,
      address,
      phone,
      active,
    } = req.body;

    const residentData = await resident.create({
      firstName,
      lastName,
      noKK,
      noNIK,
      noHouse,
      dateIn,
      dateOut,
      noKTP,
      address,
      phone,
      residentUUID: uuidv4(),
      active,
      createdBy: req.user.id, // Set createdBy to the ID of the logged-in user
      updatedBy: req.user.id, // Also set updatedBy for the initial creation
    });

    res.status(201).json(residentData);
  } catch (err) {
    // Handle duplicate noKK or noNIK
    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors[0].path;
      return res.status(400).json({
        error: `${field === "noKK" ? "Nomor KK" : "NIK"} sudah terdaftar`,
      });
    }
    console.error("Error creating resident:", err);
    res.status(400).json({ error: err.message });
  }
});

// List residents (hanya untuk admin)
router.get("/", withCreatorUpdaterNames, async (req, res) => {
  try {
    const residents = await resident.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resident by UUID
router.get("/:residentUUID", withCreatorUpdaterNames, async (req, res) => {
  console.log("get uuid");
  try {
    const residentData = await resident.findOne({
      where: { residentUUID: req.params.residentUUID },
    });
    if (!residentData) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.json(residentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resident (hanya untuk admin)
router.put("/:residentUUID", withCreatorUpdaterNames, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      noKK,
      noNIK,
      noHouse,
      dateIn,
      dateOut,
      active,
      noKTP,
      address,
      phone,
    } = req.body;

    const [updated] = await resident.update(
      {
        firstName,
        lastName,
        noKK,
        noNIK,
        noHouse,
        dateIn,
        dateOut,
        active,
        noKTP,
        address,
        phone,
        updatedBy: req.user.id, // Set updatedBy to the ID of the logged-in user
      },
      {
        where: { residentUUID: req.params.residentUUID },
        individualHooks: true, // This ensures that the 'updatedAt' field is also updated
      }
    );

    if (!updated) {
      return res.status(404).json({ error: "Resident not found" });
    }

    const updatedResident = await resident.findOne({
      where: { residentUUID: req.params.residentUUID },
    });

    // const formattedResident = await formatResidentWithCreatorUpdater(
    //   updatedResident
    // );
    res.json(updatedResident);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      return res.status(400).json({
        error: `${field === "noKK" ? "Nomor KK" : "NIK"} sudah terdaftar`,
      });
    }
    console.error("Error updating resident:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete resident (hanya untuk admin)
router.delete("/:residentUUID", async (req, res) => {
  try {
    const deleted = await resident.destroy({
      where: { residentUUID: req.params.residentUUID },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
