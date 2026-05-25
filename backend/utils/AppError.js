/**
 * AppError – custom operational error class.
 * All intentional errors thrown from services extend this.
 * The global error handler distinguishes AppError (operational)
 * from unexpected programmer errors for better logging.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;

    // Capture clean stack trace (excludes this constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
