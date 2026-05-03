"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rentals", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      book_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "books",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      patron_name: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      checkout_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      due_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      return_date: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("active", "returned", "overdue"),
        defaultValue: "active"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });

    await queryInterface.addIndex("rentals", ["status", "due_date"]);
    await queryInterface.addIndex("rentals", ["patron_name"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rentals");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rentals_status";');
  }
};

