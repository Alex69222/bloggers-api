import {body} from "express-validator";


export  const userLoginValidationMiddleware = body('login').trim().isLength({
    min: 3,
    max: 10
}).withMessage('User login should be min 3 and max 10 characters')