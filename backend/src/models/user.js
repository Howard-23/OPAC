module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash"
      },
      role: {
        type: DataTypes.ENUM("admin", "librarian"),
        allowNull: false,
        defaultValue: "librarian"
      }
    },
    {
      tableName: "users"
    }
  );

  return User;
};

