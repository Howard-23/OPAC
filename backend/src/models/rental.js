module.exports = (sequelize, DataTypes) => {
  const Rental = sequelize.define(
    "Rental",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "book_id"
      },
      patronName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "patron_name"
      },
      checkoutDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "checkout_date"
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "due_date"
      },
      returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "return_date"
      },
      status: {
        type: DataTypes.ENUM("active", "returned", "overdue"),
        allowNull: false,
        defaultValue: "active"
      }
    },
    {
      tableName: "rentals"
    }
  );

  Rental.associate = (models) => {
    Rental.belongsTo(models.Book, {
      foreignKey: "bookId",
      as: "book"
    });
  };

  return Rental;
};

