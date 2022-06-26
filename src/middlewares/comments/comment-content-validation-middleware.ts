import {body} from "express-validator";

export  const commentContentValidationMiddleware = body('content').trim().isLength({
    min:20,
    max: 300
}).withMessage('Content should be at least 20 and at most 300 characters.')