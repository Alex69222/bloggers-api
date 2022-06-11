import {body} from "express-validator";

export const contentValidationMiddleware = body('content').trim().isLength(({
    min: 5,
    max: 1000
})).withMessage('content should be min 5 and at most 1000 characters')