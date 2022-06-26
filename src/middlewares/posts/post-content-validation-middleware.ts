import {body} from "express-validator";

export const postContentValidationMiddleware = body('content').trim().isLength(({
    min: 3,
    max: 1000
})).withMessage('content should be min 20 and at most 300 characters')