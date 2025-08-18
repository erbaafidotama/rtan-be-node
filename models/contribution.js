"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contribution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  contribution.init(
    {
      contributionUUID: DataTypes.UUID,
      contributionName: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      description: DataTypes.TEXT,
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
      modelName: "contribution",
    }
  );
  return contribution;
};
