'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add createdBy and updatedBy to users table
    await queryInterface.addColumn('users', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('users', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add createdBy and updatedBy to residents table
    await queryInterface.addColumn('residents', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('residents', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns from users table
    await queryInterface.removeColumn('users', 'createdBy');
    await queryInterface.removeColumn('users', 'updatedBy');
    
    // Remove columns from residents table
    await queryInterface.removeColumn('residents', 'createdBy');
    await queryInterface.removeColumn('residents', 'updatedBy');
  }
};
