const { validationResult, body } = require('express-validator');

const validateUser = [
    // Validation checks for the request body
    body('firstname').notEmpty().withMessage('First Name is required'),
    body('lastname').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    // Custom validation logic
    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            /** get all error message */
            let errMessage = errors.array().map(it =>
                it.msg).join(",")
            /** return error message with code 422 */
            return response.status(422).json({
                success: false,
                message: errMessage
            })
        }
        next();
    }
];




module.exports = { validateUser }