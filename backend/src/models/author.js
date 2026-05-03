module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define(
    "Author",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name"
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name"
      }
    },
    {
      tableName: "authors"
    }
  );

  Author.associate = (models) => {
    Author.hasMany(models.Book, {
      foreignKey: "authorId",
      as: "books"
    });
  };

  return Author;
};

