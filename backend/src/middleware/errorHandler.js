const { ZodError } = require("zod");

function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = {
  errorHandler
};
