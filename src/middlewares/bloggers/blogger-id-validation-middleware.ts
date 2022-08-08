import {body} from "express-validator";
import {BloggersService} from "../../domain/bloggers-service";
import {bloggersService} from "../../composition-root";
// import {bloggersService} from "../../domain/bloggers-service";
// import {findBlogger} from "../../repository/bloggers-repository";
export const bloggerIdValidationMiddleware = body('bloggerId')
    .isString()
    .withMessage('blogger id should be a string')
    .custom(async (value) =>{
        const bloggerExists = await bloggersService.getBloggerById(value)
        if(!bloggerExists){
            return Promise.reject('Blogger doesn\'t exist')
        }else {
            return true
        }
})
