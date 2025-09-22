"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class resident extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // No association needed from resident to user
    }
  }
  resident.init(
    {
      residentUUID: DataTypes.UUID,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      noKK: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      noNIK: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      noKTP: DataTypes.STRING,
      headFamily: DataTypes.BOOLEAN,
      residentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "residents",
          key: "id",
        },
      },
      address: DataTypes.TEXT,
      phone: DataTypes.STRING,
      noHouse: DataTypes.STRING,
      dateIn: DataTypes.DATE,
      dateOut: DataTypes.DATE,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "resident",
    }
  );
  return resident;
};
