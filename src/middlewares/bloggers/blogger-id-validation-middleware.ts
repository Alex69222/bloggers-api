import {body} from "express-validator";

export const bloggerIdValidationMiddleware = body('bloggerId')
    .isNumeric()
    .withMessage('blogger id should be a number')