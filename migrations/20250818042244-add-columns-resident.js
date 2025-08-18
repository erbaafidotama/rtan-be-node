"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("residents", "noKTP", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("residents", "address", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("residents", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns from residents table
    await queryInterface.removeColumn("residents", "noKTP");
    await queryInterface.removeColumn("residents", "address");
    await queryInterface.removeColumn("residents", "phone");
  },
};
