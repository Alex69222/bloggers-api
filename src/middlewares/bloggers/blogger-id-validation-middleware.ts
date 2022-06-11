import {body} from "express-validator";
import {findBlogger} from "../../repository/bloggers-repository";

export const bloggerIdValidationMiddleware = body('bloggerId')
    .isNumeric()
    .withMessage('blogger id should be a number')
    .custom(value =>{
        const bloggerExists = findBlogger(+value)
        if(!bloggerExists){
            return Promise.reject('Blogger doesn\'t exist')
        }else {
            return true
        }
})
