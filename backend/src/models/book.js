module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "author_id"
      },
      publisher: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      publicationYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "publication_year"
      },
      callNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "call_number"
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
      accessUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: "access_url"
      }
    },
    {
      tableName: "books"
    }
  );

  Book.associate = (models) => {
    Book.belongsTo(models.Author, {
      foreignKey: "authorId",
      as: "author"
    });
    Book.hasMany(models.Rental, {
      foreignKey: "bookId",
      as: "rentals"
    });
  };

  return Book;
};

