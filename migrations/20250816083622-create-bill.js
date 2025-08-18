"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bills", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      billUUID: {
        type: Sequelize.UUID,
      },
      residentId: {
        type: Sequelize.INTEGER,
      },
      contributionId: {
        type: Sequelize.INTEGER,
      },
      period: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("Unpaid", "Paid", "Pending"),
        allowNull: false,
        defaultValue: "Unpaid",
      },
      paymentFinishDate: {
        type: Sequelize.DATE,
      },
      description: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bills");
  },
};
