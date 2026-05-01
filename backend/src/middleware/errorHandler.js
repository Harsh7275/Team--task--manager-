const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    err.message = `Resource not found. Invalid: ${err.path}`;
    err.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err.message = message;
    err.statusCode = 400;
  }

  // JWT wrong signature error
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Json Web Token is invalid, Try again !!!';
    err.statusCode = 400;
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    err.message = 'Json Web Token is expired, Try again !!!';
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
