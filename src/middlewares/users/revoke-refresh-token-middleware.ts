import {Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {usersService} from "../../domain/users-service";

export const  revokeRefreshTokenMiddleware = async (req: Request, res: Response) =>{
    if (!req.cookies.refreshToken) {
        res.sendStatus(401)
        return
    }
    const refreshToken = req.cookies.refreshToken
    const userId = await jwtService.getUserIdByToken(refreshToken)
    if(!userId) return res.sendStatus(401)
    await usersService.removeRefreshToken(userId, refreshToken)
    res.clearCookie('refreshToken')
    res.sendStatus(204)
}