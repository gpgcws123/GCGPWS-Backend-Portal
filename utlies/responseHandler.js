/**
 * Response handler utility for consistent API responses
 */

// Success response format
exports.successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response format
exports.errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// Not found response
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message
  });
};

// Unauthorized response
exports.unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// Forbidden response
exports.forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// Bad request response
exports.badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return res.status(400).json({
    success: false,
    message,
    errors
  });
};
