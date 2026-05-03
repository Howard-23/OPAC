const { Op } = require("sequelize");
const { z } = require("zod");
const { Author, Book, Rental, sequelize } = require("../models");
const { currentDateString, deriveRentalStatus, syncRentalStatuses } = require("../utils/rentalStatus");

const createRentalSchema = z.object({
  bookId: z.string().uuid(),
  patronName: z.string().trim().min(1),
  checkoutDate: z.string().min(1),
  dueDate: z.string().min(1)
});

const updateRentalSchema = z.object({
  patronName: z.string().trim().min(1),
  checkoutDate: z.string().min(1),
  dueDate: z.string().min(1),
  status: z.enum(["active", "returned", "overdue"])
});

async function listRentals(req, res) {
  await syncRentalStatuses();

  const rentals = await Rental.findAll({
    include: [
      {
        model: Book,
        as: "book",
        include: [{ model: Author, as: "author" }]
      }
    ],
    order: [["checkoutDate", "DESC"]]
  });

  return res.json(
    rentals.map((rental) => ({
      ...rental.toJSON(),
      status: deriveRentalStatus(rental)
    }))
  );
}

async function getRental(req, res) {
  await syncRentalStatuses();

  const rental = await Rental.findByPk(req.params.id, {
    include: [
      {
        model: Book,
        as: "book",
        include: [{ model: Author, as: "author" }]
      }
    ]
  });

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  return res.json({
    ...rental.toJSON(),
    status: deriveRentalStatus(rental)
  });
}

async function createRental(req, res) {
  const payload = createRentalSchema.parse(req.body);
  const book = await Book.findByPk(payload.bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.format !== "physical") {
    return res.status(409).json({ message: "Digital books are read online and cannot be checked out" });
  }

  if (book.status !== "available") {
    return res.status(409).json({ message: "Book is not available for checkout" });
  }

  const rental = await sequelize.transaction(async (transaction) => {
    const created = await Rental.create(
      {
        ...payload,
        status: payload.dueDate < currentDateString() ? "overdue" : "active"
      },
      { transaction }
    );

    await book.update({ status: "borrowed" }, { transaction });
    return created;
  });

  return res.status(201).json(rental);
}

async function updateRental(req, res) {
  const payload = updateRentalSchema.parse(req.body);
  const rental = await Rental.findByPk(req.params.id);

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  await rental.update(payload);
  return res.json(rental);
}

async function returnRental(req, res) {
  const rental = await Rental.findByPk(req.params.id);

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  if (rental.returnDate) {
    return res.status(409).json({ message: "Rental has already been returned" });
  }

  const returnDate = req.body?.returnDate || currentDateString();

  const updated = await sequelize.transaction(async (transaction) => {
    await rental.update(
      {
        returnDate,
        status: "returned"
      },
      { transaction }
    );

    await Book.update(
      { status: "available" },
      {
        where: { id: rental.bookId },
        transaction
      }
    );

    return rental;
  });

  return res.json(updated);
}

async function deleteRental(req, res) {
  const rental = await Rental.findByPk(req.params.id);

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  if (!rental.returnDate && rental.status !== "returned") {
    return res.status(409).json({ message: "Return the book before deleting the rental record" });
  }

  await rental.destroy();
  return res.status(204).send();
}

module.exports = {
  listRentals,
  getRental,
  createRental,
  updateRental,
  returnRental,
  deleteRental
};
