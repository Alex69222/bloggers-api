import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";

export const validationResultMiddleware = (req: Request, res: Response, next: NextFunction) =>{

    const customResponseValidation = validationResult.withDefaults({
        formatter: error => {
            return{
                message: error.msg,
                field: error.param
            }
        }
    })
    const errors = customResponseValidation(req)

    if(!errors.isEmpty()){
        console.log('body STRING LIKE STATUS:')
        console.log(req.body)
        return res.status(400).json({errorsMessages: errors.array({onlyFirstError: true})})
    }else{
        next()
    }
}