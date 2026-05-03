"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.Author, {
        foreignKey: "author_id",
        as: "author"
      });
      Book.hasMany(models.Rental, {
        foreignKey: "book_id",
        as: "rentals"
      });
    }
  }

  Book.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      publisher: {
        type: DataTypes.STRING,
        allowNull: true
      },
      publication_year: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      call_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("available", "borrowed", "lost"),
        allowNull: false,
        defaultValue: "available"
      },
      format: {
        type: DataTypes.ENUM("physical", "digital"),
        allowNull: false,
        defaultValue: "physical"
      },
      access_url: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "Books"
    }
  );

  return Book;
};
