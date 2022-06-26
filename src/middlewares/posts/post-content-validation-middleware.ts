import {body} from "express-validator";

export const postContentValidationMiddleware = body('content').trim().isLength(({
    min: 1,
    max: 1000
})).withMessage('content is required and should be at most 300 characters')