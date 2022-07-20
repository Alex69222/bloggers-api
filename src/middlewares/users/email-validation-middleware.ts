import {body} from "express-validator";

export const emailValidationMiddleware = body('email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Please, provide a valid email address fo registration')
