const { Author, Sequelize } = require("../config/database");
const httpError = require("../utils/httpError");
const { buildPaginationMeta, parsePagination } = require("../utils/pagination");
const { validateAuthorPayload } = require("../utils/validation");

async function listAuthors(req, res) {
  const { all, limit, offset, page, pageSize } = parsePagination(req.query);
  const q = req.query.q?.trim();
  const where = {};

  if (q) {
    where[Sequelize.Op.or] = [
      {
        first_name: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      },
      {
        last_name: {
          [Sequelize.Op.iLike]: `%${q}%`
        }
      }
    ];
  }

  const order = [
    ["last_name", "ASC"],
    ["first_name", "ASC"]
  ];

  if (all) {
    const authors = await Author.findAll({ where, order });
    return res.json({
      data: authors,
      meta: buildPaginationMeta({
        totalItems: authors.length,
        page: 1,
        pageSize: authors.length || 1
      })
    });
  }

  const { count, rows } = await Author.findAndCountAll({
    where,
    order,
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

async function getAuthor(req, res) {
  const author = await Author.findByPk(req.params.id);

  if (!author) {
    throw httpError(404, "Author not found.");
  }

  res.json(author);
}

async function createAuthor(req, res) {
  const { errors, value } = validateAuthorPayload(req.body);

  if (errors.length > 0) {
    throw httpError(400, "Author validation failed.", errors);
  }

  const duplicateAuthor = await Author.findOne({
    where: {
      first_name: {
        [Sequelize.Op.iLike]: value.first_name
      },
      last_name: {
        [Sequelize.Op.iLike]: value.last_name
      }
    }
  });

  if (duplicateAuthor) {
    throw httpError(409, "This author already exists.");
  }

  const author = await Author.create(value);
  res.status(201).json(author);
}

async function updateAuthor(req, res) {
  const author = await Author.findByPk(req.params.id);

  if (!author) {
    throw httpError(404, "Author not found.");
  }

  const { errors, value } = validateAuthorPayload(req.body);

  if (errors.length > 0) {
    throw httpError(400, "Author validation failed.", errors);
  }

  const duplicateAuthor = await Author.findOne({
    where: {
      id: {
        [Sequelize.Op.ne]: author.id
      },
      first_name: {
        [Sequelize.Op.iLike]: value.first_name
      },
      last_name: {
        [Sequelize.Op.iLike]: value.last_name
      }
    }
  });

  if (duplicateAuthor) {
    throw httpError(409, "This author already exists.");
  }

  await author.update(value);
  res.json(author);
}

async function deleteAuthor(req, res) {
  const author = await Author.findByPk(req.params.id);

  if (!author) {
    throw httpError(404, "Author not found.");
  }

  await author.destroy();
  res.status(204).send();
}

module.exports = {
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
