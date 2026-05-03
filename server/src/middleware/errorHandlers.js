function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "A unique field already exists.",
      details: error.errors?.map((item) => item.message) || null
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      message: "This record is still referenced by related data.",
      details: error.message
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details: error.details || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
