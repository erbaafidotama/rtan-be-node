"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("payments", "contributionId", "billId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("payments", "billId", "contributionId");
  },
};
