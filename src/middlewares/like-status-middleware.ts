import {body, check, oneOf} from "express-validator";
import {bloggersService} from "../composition-root";

export  const  likeStatusMiddleware = body('likeStatus')


    .custom(async (value) =>{
        console.log(body)
        if(value !== 'None' && value !== 'Like' && value !== 'Dislike'){
            return Promise.reject(`Incorrect value passed: ${value}`)
        }else {
            return true
        }
    })