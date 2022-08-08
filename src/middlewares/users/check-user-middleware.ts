import {NextFunction, Request, Response} from "express";
import {jwtService, usersService} from "../../composition-root";

export const checkUserMiddleware = async (req: Request<{},null,{},{}>, res: Response<null>, next: NextFunction) =>{
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1]
        const userId = await jwtService.getUserIdByToken(token)
        if(userId){
            req.user = await usersService.findUserById(userId)
        }
    }
    next()
}