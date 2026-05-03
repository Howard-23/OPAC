const { Author, Book } = require("../models");
const { z } = require("zod");

const authorSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1)
});

async function listAuthors(req, res) {
  const authors = await Author.findAll({
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"]
    ],
    include: [
      {
        model: Book,
        as: "books",
        attributes: ["id"]
      }
    ]
  });

  return res.json(
    authors.map((author) => ({
      ...author.toJSON(),
      booksCount: author.books.length
    }))
  );
}

async function getAuthor(req, res) {
  const author = await Author.findByPk(req.params.id, {
    include: [
      {
        model: Book,
        as: "books",
        order: [["title", "ASC"]]
      }
    ]
  });

  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  return res.json(author);
}

async function createAuthor(req, res) {
  const payload = authorSchema.parse(req.body);
  const author = await Author.create(payload);
  return res.status(201).json(author);
}

async function updateAuthor(req, res) {
  const payload = authorSchema.parse(req.body);
  const author = await Author.findByPk(req.params.id);

  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  await author.update(payload);
  return res.json(author);
}

async function deleteAuthor(req, res) {
  const author = await Author.findByPk(req.params.id, {
    include: [{ model: Book, as: "books", attributes: ["id"] }]
  });

  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  if (author.books.length > 0) {
    return res.status(409).json({
      message: "Cannot delete an author with existing books"
    });
  }

  await author.destroy();
  return res.status(204).send();
}

module.exports = {
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
