import {NextFunction, Request, Response} from "express";

const auth = 'Basic YWRtaW46cXdlcnR5'

export const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if(req.headers.authorization === auth){
        next()
    }else{
        res.send(401)
    }
}