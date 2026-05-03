const { Op } = require("sequelize");
const { z } = require("zod");
const { Author, Book, Rental } = require("../models");
const { fetchGoogleBookByIsbn } = require("../utils/googleBooks");

const bookSchema = z
  .object({
    isbn: z.string().trim().min(10).max(20),
    title: z.string().trim().min(1),
    authorId: z.string().uuid(),
    publisher: z.string().trim().nullable().optional(),
    publicationYear: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
      z.number().int().min(0).max(3000).nullable()
    ),
    callNumber: z.string().trim().nullable().optional(),
    status: z.enum(["available", "borrowed", "lost"]).default("available"),
    format: z.enum(["physical", "digital"]).default("physical"),
    accessUrl: z.string().trim().url().nullable().optional()
  })
  .superRefine((value, ctx) => {
    if (value.format === "digital" && !value.accessUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Digital books require an access URL",
        path: ["accessUrl"]
      });
    }

    if (value.format === "physical" && value.accessUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Physical books should not include an access URL",
        path: ["accessUrl"]
      });
    }
  });

async function listBooks(req, res) {
  const query = String(req.query.q || "").trim();

  const where = query
    ? {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { isbn: { [Op.iLike]: `%${query}%` } },
          { callNumber: { [Op.iLike]: `%${query}%` } },
          { format: { [Op.iLike]: `%${query}%` } },
          { "$author.firstName$": { [Op.iLike]: `%${query}%` } },
          { "$author.lastName$": { [Op.iLike]: `%${query}%` } }
        ]
      }
    : undefined;

  const books = await Book.findAll({
    where,
    include: [{ model: Author, as: "author" }],
    order: [["title", "ASC"]]
  });

  return res.json(books);
}

async function getBook(req, res) {
  const book = await Book.findByPk(req.params.id, {
    include: [
      { model: Author, as: "author" },
      { model: Rental, as: "rentals" }
    ],
    order: [[{ model: Rental, as: "rentals" }, "checkoutDate", "DESC"]]
  });

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book);
}

async function createBook(req, res) {
  const payload = bookSchema.parse(req.body);
  const book = await Book.create(payload);
  return res.status(201).json(book);
}

async function updateBook(req, res) {
  const payload = bookSchema.parse(req.body);
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  await book.update(payload);
  return res.json(book);
}

async function deleteBook(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const activeRental = await Rental.findOne({
    where: {
      bookId: req.params.id,
      status: {
        [Op.in]: ["active", "overdue"]
      }
    }
  });

  if (activeRental) {
    return res.status(409).json({
      message: "Cannot delete a book with an active rental"
    });
  }

  await book.destroy();
  return res.status(204).send();
}

async function lookupBookByIsbn(req, res) {
  const data = await fetchGoogleBookByIsbn(req.params.isbn);

  if (!data) {
    return res.status(404).json({ message: "No Google Books match found" });
  }

  return res.json(data);
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  lookupBookByIsbn
};
