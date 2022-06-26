import {body} from "express-validator";

export const userPasswordValidationMiddleware = body('password').trim().isLength({
    min: 6,
    max: 20
}).withMessage('Passowrd should be min 6 and max 20 characters.')