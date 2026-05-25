/**
 * asyncHandler – wraps async route controllers to eliminate try/catch boilerplate.
 * Automatically forwards any thrown errors to Express's global error handler.
 *
 * Usage: export const myController = asyncHandler(async (req, res, next) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
