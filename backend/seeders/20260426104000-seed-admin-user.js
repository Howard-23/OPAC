"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("users", [
      {
        id: "8ce6c8b2-f828-4354-8c31-c2a4fd36f3f2",
        username: "admin",
        password_hash: passwordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { username: "admin" });
  }
};

