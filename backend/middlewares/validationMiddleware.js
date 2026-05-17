import { validationResult } from 'express-validator';

/**
 * Runs after express-validator chains.
 * If validation fails, formats errors and sends 422.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};
