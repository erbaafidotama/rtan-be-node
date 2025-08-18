"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      bill.belongsTo(models.resident, { foreignKey: "residentId" });
      bill.belongsTo(models.contribution, { foreignKey: "contributionId" });
    }
  }
  bill.init(
    {
      billUUID: DataTypes.UUID,
      residentId: DataTypes.INTEGER,
      contributionId: DataTypes.INTEGER,
      period: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM("Unpaid", "Paid", "Pending"),
        allowNull: false,
        defaultValue: "Unpaid",
      },
      paymentFinishDate: DataTypes.DATE,
      description: DataTypes.TEXT,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
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
      modelName: "bill",
    }
  );
  return bill;
};
