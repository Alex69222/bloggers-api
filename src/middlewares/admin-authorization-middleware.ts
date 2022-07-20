import {NextFunction, Request, Response} from "express";

const auth = 'Basic YWRtaW46cXdlcnR5'

export const adminAuthorizationMiddleware = (req: Request<{},null, {},{}>, res: Response<null>, next: NextFunction): void | null => {
    if(req.headers.authorization === auth){
        next()
    }else{
        res.sendStatus(401)
    }
}