const { Book, Rental } = require("../models");
const { Op } = require("sequelize");
const { currentDateString, syncRentalStatuses } = require("../utils/rentalStatus");

async function getDashboardSummary(req, res) {
  await syncRentalStatuses();

  const today = currentDateString();

  const [totalBooks, activeRentals, overdueBooks, availableBooks, digitalBooks] = await Promise.all([
    Book.count(),
    Rental.count({
      where: {
        status: {
          [Op.in]: ["active", "overdue"]
        }
      }
    }),
    Rental.count({
      where: {
        returnDate: null,
        dueDate: {
          [Op.lt]: today
        }
      }
    }),
    Book.count({
      where: { status: "available" }
    }),
    Book.count({
      where: { format: "digital" }
    })
  ]);

  return res.json({
    totalBooks,
    activeRentals,
    overdueBooks,
    availableBooks,
    digitalBooks
  });
}

module.exports = {
  getDashboardSummary
};
