import {body} from "express-validator";

export const shortDescriptionValidationMiddleware = body('shortDescription').trim().isLength(({
    min: 5,
    max: 100
})).withMessage('short description should be min 5 and at most 30 characters')