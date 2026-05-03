"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Books", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      isbn: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Authors",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      publisher: {
        type: Sequelize.STRING,
        allowNull: true
      },
      publication_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      call_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM("available", "borrowed", "lost"),
        allowNull: false,
        defaultValue: "available"
      },
      format: {
        type: Sequelize.ENUM("physical", "digital"),
        allowNull: false,
        defaultValue: "physical"
      },
      access_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Books");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Books_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Books_format";');
  }
};
