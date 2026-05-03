const { Op } = require("sequelize");
const { Rental } = require("../models");

function currentDateString() {
  return new Date().toISOString().slice(0, 10);
}

function deriveRentalStatus(rental) {
  if (rental.returnDate) {
    return "returned";
  }

  return rental.dueDate < currentDateString() ? "overdue" : "active";
}

async function syncRentalStatuses() {
  const today = currentDateString();

  await Rental.update(
    { status: "overdue" },
    {
      where: {
        returnDate: null,
        dueDate: {
          [Op.lt]: today
        }
      }
    }
  );

  await Rental.update(
    { status: "active" },
    {
      where: {
        returnDate: null,
        dueDate: {
          [Op.gte]: today
        }
      }
    }
  );
}

module.exports = {
  currentDateString,
  deriveRentalStatus,
  syncRentalStatuses
};

