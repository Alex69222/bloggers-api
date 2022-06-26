import {body} from "express-validator";
import {bloggersService} from "../../domain/bloggers-service";
// import {findBlogger} from "../../repository/bloggers-repository";

export const bloggerIdValidationMiddleware = body('bloggerId')
    .isNumeric()
    .withMessage('blogger id should be a number')
    .custom(async (value) =>{
        const bloggerExists = await bloggersService.getBloggerById(value)
        if(!bloggerExists){
            return Promise.reject('Blogger doesn\'t exist')
        }else {
            return true
        }
})
