"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("authors", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      first_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      last_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
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

    await queryInterface.addIndex("authors", ["last_name", "first_name"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("authors");
  }
};

