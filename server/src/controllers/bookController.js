const { Author, Book, Sequelize } = require("../config/database");
const { fetchBookByIsbn } = require("../services/googleBooksService");
const httpError = require("../utils/httpError");
const pickBookPayload = require("../utils/pickBookPayload");
const { buildPaginationMeta, parsePagination } = require("../utils/pagination");
const { validateBookPayload } = require("../utils/validation");

async function listBooks(req, res) {
  const { all, limit, offset, page, pageSize } = parsePagination(req.query);
  const where = {};
  const q = req.query.q?.trim();

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.format) {
    where.format = req.query.format;
  }

  if (q) {
    where[Sequelize.Op.or] = [
      {
        title: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        isbn: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        publisher: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        call_number: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        "$author.first_name$": {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        "$author.last_name$": {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      }
    ];
  }

  const queryOptions = {
    where,
    include: [
      {
        model: Author,
        as: "author"
      }
    ],
    order: [["title", "ASC"]],
    distinct: true,
    subQuery: false
  };

  if (all) {
    const books = await Book.findAll(queryOptions);
    return res.json({
      data: books,
      meta: buildPaginationMeta({
        totalItems: books.length,
        page: 1,
        pageSize: books.length || 1
      })
    });
  }

  const { count, rows } = await Book.findAndCountAll({
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

async function getBook(req, res) {
  const book = await Book.findByPk(req.params.id, {
    include: [
      {
        model: Author,
        as: "author"
      }
    ]
  });

  if (!book) {
    throw httpError(404, "Book not found.");
  }

  res.json(book);
}

async function createBook(req, res) {
  const payload = pickBookPayload(req.body);
  const { errors, value } = validateBookPayload(payload);

  if (errors.length > 0) {
    throw httpError(400, "Book validation failed.", errors);
  }

  const author = await Author.findByPk(value.author_id);

  if (!author) {
    throw httpError(400, "Selected author does not exist.");
  }

  const existingBook = await Book.findOne({
    where: {
      isbn: value.isbn
    }
  });

  if (existingBook) {
    throw httpError(409, "A book with this ISBN already exists.");
  }

  const book = await Book.create(value);
  const createdBook = await Book.findByPk(book.id, {
    include: [{ model: Author, as: "author" }]
  });

  res.status(201).json(createdBook);
}

async function updateBook(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    throw httpError(404, "Book not found.");
  }

  const payload = pickBookPayload(req.body);
  const { errors, value } = validateBookPayload(payload);

  if (errors.length > 0) {
    throw httpError(400, "Book validation failed.", errors);
  }

  const author = await Author.findByPk(value.author_id);

  if (!author) {
    throw httpError(400, "Selected author does not exist.");
  }

  const existingBook = await Book.findOne({
    where: {
      id: {
        [Sequelize.Op.ne]: book.id
      },
      isbn: value.isbn
    }
  });

  if (existingBook) {
    throw httpError(409, "A book with this ISBN already exists.");
  }

  await book.update(value);

  const updatedBook = await Book.findByPk(book.id, {
    include: [{ model: Author, as: "author" }]
  });

  res.json(updatedBook);
}

async function deleteBook(req, res) {
  const book = await Book.findByPk(req.params.id);

  if (!book) {
    throw httpError(404, "Book not found.");
  }

  await book.destroy();
  res.status(204).send();
}

async function lookupBookByIsbn(req, res) {
  const isbn = req.params.isbn?.trim();

  if (!isbn) {
    throw httpError(400, "ISBN is required.");
  }

  if (!/^(?:[\dXx-]|\s)+$/.test(isbn)) {
    throw httpError(400, "ISBN contains invalid characters.");
  }

  const result = await fetchBookByIsbn(isbn);

  if (!result) {
    throw httpError(404, "No Google Books record found for this ISBN.");
  }

  res.json(result);
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  lookupBookByIsbn
};
