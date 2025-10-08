const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = null;

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry found';
  } else if (err.message) {
    // Custom error messages
    if (err.message.includes('not found')) {
      statusCode = 404;
      message = err.message;
    } else if (err.message.includes('Validation failed')) {
      statusCode = 400;
      message = err.message;
    } else if (err.message.includes('already booked')) {
      statusCode = 409;
      message = err.message;
    } else {
      message = err.message;
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
