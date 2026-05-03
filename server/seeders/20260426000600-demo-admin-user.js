"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingUser = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE username = :username LIMIT 1;',
      {
        replacements: { username: "librarian" },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      return;
    }

    const passwordHash = await bcrypt.hash("LibraryAdmin123!", 10);

    await queryInterface.bulkInsert("Users", [
      {
        id: queryInterface.sequelize.literal("gen_random_uuid()"),
        username: "librarian",
        password_hash: passwordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", { username: "librarian" });
  }
};
