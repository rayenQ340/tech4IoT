module.exports = (err, req, res, next) => {
  // Default error response
  let response = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  };

  // Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    response = {
      status: 'error',
      message: err.errors[0]?.message || 'Duplicate value',
      code: 'DUPLICATE_ENTRY',
      field: err.errors[0]?.path,
      value: err.errors[0]?.value
    };
    return res.status(409).json(response);
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    response = {
      status: 'error',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.errors?.map(e => ({
        field: e.path,
        message: e.message,
        type: e.type
      }))
    };
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    response = {
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    };
    return res.status(401).json(response);
  }

  // Log the error
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Development-only details
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.originalError = {
      name: err.name,
      ...err
    };
  }

  // Final error response
  res.status(err.statusCode || 500).json(response);
};