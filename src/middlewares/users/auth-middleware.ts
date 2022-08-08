import {NextFunction, Request, Response} from "express";
import {jwtService, usersService} from "../../composition-root";

export const authMiddleware = async (req: Request<{},null,{},{}>, res: Response<null>, next: NextFunction) =>{
    if(!req.headers.authorization){
        res.sendStatus(401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]
    const userId = await jwtService.getUserIdByToken(token)
    if(userId){
        req.user = await usersService.findUserById(userId)
        next()
    }else{
        return res.sendStatus(401)
    }
}