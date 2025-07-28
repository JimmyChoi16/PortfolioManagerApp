const { body } = require('express-validator');

const validationRules = {
  createHolding: [
    body('symbol')
      .notEmpty()
      .withMessage('Symbol is required')
      .isLength({ min: 1, max: 10 })
      .withMessage('Symbol must be between 1 and 10 characters')
      .matches(/^[A-Za-z0-9.-]+$/)
      .withMessage('Symbol can only contain letters, numbers, dots, and hyphens'),
    
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('type')
      .isIn(['stock', 'bond', 'cash', 'fund', 'crypto'])
      .withMessage('Type must be one of: stock, bond, cash, fund, crypto'),
    
    body('quantity')
      .isFloat({ min: 0.000001 })
      .withMessage('Quantity must be a positive number'),
    
    body('purchase_price')
      .isFloat({ min: 0.01 })
      .withMessage('Purchase price must be a positive number'),
    
    body('purchase_date')
      .isISO8601()
      .withMessage('Purchase date must be a valid date in ISO format (YYYY-MM-DD)')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          throw new Error('Purchase date cannot be in the future');
        }
        return true;
      })
  ],

  updateHolding: [
    body('symbol')
      .notEmpty()
      .withMessage('Symbol is required')
      .isLength({ min: 1, max: 10 })
      .withMessage('Symbol must be between 1 and 10 characters')
      .matches(/^[A-Za-z0-9.-]+$/)
      .withMessage('Symbol can only contain letters, numbers, dots, and hyphens'),
    
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    
    body('type')
      .isIn(['stock', 'bond', 'cash', 'fund', 'crypto'])
      .withMessage('Type must be one of: stock, bond, cash, fund, crypto'),
    
    body('quantity')
      .isFloat({ min: 0.000001 })
      .withMessage('Quantity must be a positive number'),
    
    body('purchase_price')
      .isFloat({ min: 0.01 })
      .withMessage('Purchase price must be a positive number'),
    
    body('current_price')
      .isFloat({ min: 0.01 })
      .withMessage('Current price must be a positive number'),
    
    body('purchase_date')
      .isISO8601()
      .withMessage('Purchase date must be a valid date in ISO format (YYYY-MM-DD)')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          throw new Error('Purchase date cannot be in the future');
        }
        return true;
      })
  ]
};

module.exports = validationRules;