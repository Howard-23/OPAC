"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rental extends Model {
    static associate(models) {
      Rental.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book"
      });
    }
  }

  Rental.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      book_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      patron_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      checkout_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "checked_out"
      }
    },
    {
      sequelize,
      modelName: "Rental",
      tableName: "Rentals"
    }
  );

  return Rental;
};
