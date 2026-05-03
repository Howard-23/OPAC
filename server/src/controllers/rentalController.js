const { Book, Rental, Sequelize, sequelize } = require("../config/database");
const httpError = require("../utils/httpError");
const { buildPaginationMeta, parsePagination } = require("../utils/pagination");
const { validateRentalPayload } = require("../utils/validation");

async function listRentals(req, res) {
  const { all, limit, offset, page, pageSize } = parsePagination(req.query);
  const q = req.query.q?.trim();
  const where = {};

  if (req.query.status) {
    if (req.query.status === "overdue") {
      where.return_date = null;
      where.due_date = {
        [Sequelize.Op.lt]: new Date().toISOString().slice(0, 10)
      };
    } else {
      where.status = req.query.status;
    }
  }

  if (q) {
    where[Sequelize.Op.or] = [
      {
        patron_name: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        "$book.title$": {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        "$book.isbn$": {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      }
    ];
  }

  const queryOptions = {
    where,
    include: [
      {
        model: Book,
        as: "book"
      }
    ],
    order: [["checkout_date", "DESC"]],
    distinct: true,
    subQuery: false
  };

  if (all) {
    const rentals = await Rental.findAll(queryOptions);
    return res.json({
      data: rentals,
      meta: buildPaginationMeta({
        totalItems: rentals.length,
        page: 1,
        pageSize: rentals.length || 1
      })
    });
  }

  const { count, rows } = await Rental.findAndCountAll({
    ...queryOptions,
    limit,
    offset
  });

  return res.json({
    data: rows,
    meta: buildPaginationMeta({
      totalItems: count,
      page,
      pageSize
    })
  });
}

async function getRental(req, res) {
  const rental = await Rental.findByPk(req.params.id, {
    include: [{ model: Book, as: "book" }]
  });

  if (!rental) {
    throw httpError(404, "Rental not found.");
  }

  res.json(rental);
}

async function createRental(req, res) {
  const { errors, value } = validateRentalPayload(req.body);

  if (errors.length > 0) {
    throw httpError(400, "Rental validation failed.", errors);
  }

  const transaction = await sequelize.transaction();

  try {
    const book = await Book.findByPk(value.book_id, { transaction });

    if (!book) {
      throw httpError(400, "Selected book does not exist.");
    }

    if (book.format !== "physical") {
      throw httpError(409, "Digital books cannot be checked out as rentals.");
    }

    if (book.status !== "available") {
      throw httpError(409, "Only available books can be checked out.");
    }

    const rental = await Rental.create(
      {
        ...value
      },
      { transaction }
    );

    await book.update({ status: "borrowed" }, { transaction });
    await transaction.commit();

    const createdRental = await Rental.findByPk(rental.id, {
      include: [{ model: Book, as: "book" }]
    });

    res.status(201).json(createdRental);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function updateRental(req, res) {
  const rental = await Rental.findByPk(req.params.id, {
    include: [{ model: Book, as: "book" }]
  });

  if (!rental) {
    throw httpError(404, "Rental not found.");
  }

  const transaction = await sequelize.transaction();

  try {
    const { errors, value } = validateRentalPayload({
      book_id: rental.book_id,
      patron_name: req.body.patron_name ?? rental.patron_name,
      checkout_date: req.body.checkout_date ?? rental.checkout_date,
      due_date: req.body.due_date ?? rental.due_date,
      return_date: req.body.return_date ?? rental.return_date,
      status: req.body.status ?? rental.status
    });

    if (errors.length > 0) {
      throw httpError(400, "Rental validation failed.", errors);
    }

    const nextStatus = value.status;
    const nextReturnDate = value.return_date;

    await rental.update(
      {
        patron_name: value.patron_name,
        checkout_date: value.checkout_date,
        due_date: value.due_date,
        return_date: nextReturnDate,
        status: nextStatus
      },
      { transaction }
    );

    if (nextReturnDate || nextStatus === "returned") {
      await Book.update(
        { status: "available" },
        {
          where: { id: rental.book_id },
          transaction
        }
      );

      if (!nextReturnDate) {
        await rental.update(
          {
            return_date: new Date().toISOString().slice(0, 10),
            status: "returned"
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    const updatedRental = await Rental.findByPk(rental.id, {
      include: [{ model: Book, as: "book" }]
    });

    res.json(updatedRental);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function returnRental(req, res) {
  const rental = await Rental.findByPk(req.params.id);

  if (!rental) {
    throw httpError(404, "Rental not found.");
  }

  if (rental.return_date || rental.status === "returned") {
    throw httpError(409, "Rental has already been returned.");
  }

  const transaction = await sequelize.transaction();

  try {
    const returnDate = req.body.return_date || new Date().toISOString().slice(0, 10);

    if (new Date(returnDate) < new Date(rental.checkout_date)) {
      throw httpError(400, "Return date cannot be earlier than checkout date.");
    }

    await rental.update(
      {
        return_date: returnDate,
        status: "returned"
      },
      { transaction }
    );

    await Book.update(
      { status: "available" },
      {
        where: { id: rental.book_id },
        transaction
      }
    );

    await transaction.commit();

    const returnedRental = await Rental.findByPk(rental.id, {
      include: [{ model: Book, as: "book" }]
    });

    res.json(returnedRental);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function deleteRental(req, res) {
  const rental = await Rental.findByPk(req.params.id);

  if (!rental) {
    throw httpError(404, "Rental not found.");
  }

  const transaction = await sequelize.transaction();

  try {
    if (!rental.return_date && rental.status !== "returned") {
      await Book.update(
        { status: "available" },
        {
          where: { id: rental.book_id },
          transaction
        }
      );
    }

    await rental.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  res.status(204).send();
}

async function rentalSummary(_req, res) {
  const activeCount = await Rental.count({
    where: {
      return_date: null,
      status: {
        [Sequelize.Op.not]: "returned"
      }
    }
  });

  const overdueCount = await Rental.count({
    where: {
      due_date: {
        [Sequelize.Op.lt]: new Date().toISOString().slice(0, 10)
      },
      return_date: null
    }
  });

  res.json({
    activeCount,
    overdueCount
  });
}

module.exports = {
  listRentals,
  getRental,
  createRental,
  updateRental,
  returnRental,
  deleteRental,
  rentalSummary
};
