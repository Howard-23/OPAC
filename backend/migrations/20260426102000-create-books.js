"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("books", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      isbn: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(20)
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      author_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "authors",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      publisher: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      publication_year: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      call_number: {
        allowNull: true,
        type: Sequelize.STRING(100)
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("available", "borrowed", "lost"),
        defaultValue: "available"
      },
      format: {
        allowNull: false,
        type: Sequelize.ENUM("physical", "digital"),
        defaultValue: "physical"
      },
      access_url: {
        allowNull: true,
        type: Sequelize.STRING(2048)
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

    await queryInterface.addIndex("books", ["title"]);
    await queryInterface.addIndex("books", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("books");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_books_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_books_format";');
  }
};

