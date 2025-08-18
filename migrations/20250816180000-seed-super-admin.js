"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(process.env.ADM_PSS, 12);

    await queryInterface.bulkInsert("users", [
      {
        userUUID: "00000000-0000-0000-0000-000000000001",
        firstName: "admin",
        lastName: "super",
        email: process.env.ADM_EML,
        password: hashedPassword,
        residentId: null,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: "admin@admin.com",
    });
  },
};
