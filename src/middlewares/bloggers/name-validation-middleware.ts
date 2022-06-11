import {body} from "express-validator";

export const nameValidationMiddleware = body('name')
    .trim()
    .isLength(({
        min: 3,
        max: 15
    })).withMessage('name should be at least 3 and at most 15 characters')