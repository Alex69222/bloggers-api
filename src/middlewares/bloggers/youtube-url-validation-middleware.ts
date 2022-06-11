import {body} from "express-validator";

export const youtubeUrlValidationMiddleware = body('youtubeUrl').trim()
    .isLength(({
        min: 5,
        max: 100
    }))
    .withMessage('youtubeUrl should be at most 100 characters')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('youtubeUrl should be a valid url address')