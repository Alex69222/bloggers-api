import {body} from "express-validator";

export const titleValidationMiddleware = body('title').trim().isLength(({
    min: 3,
    max: 30
})).withMessage('title should be min 3 and at most 30 characters')