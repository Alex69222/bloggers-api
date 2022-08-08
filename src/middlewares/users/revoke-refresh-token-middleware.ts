import {Request, Response} from "express";
import {UsersService} from "../../domain/users-service";
import {JwtService} from "../../application/jwt-service";
import {jwtService, usersService} from "../../composition-root";


export interface BlackList {
    [token: string]: boolean
}
export  const  tokensBlackList:BlackList = {}
export const  revokeRefreshTokenMiddleware = async (req: Request, res: Response) =>{
    if (!req.cookies.refreshToken) {
        res.sendStatus(401)
        return
    }
    const refreshToken = req.cookies.refreshToken
    if (tokensBlackList[refreshToken]) {
        res.clearCookie('refreshToken')
        return res.sendStatus(401)
    }
    tokensBlackList[refreshToken] = true

    console.log(tokensBlackList)

    const userId = await jwtService.getUserIdByToken(refreshToken)
    if(!userId) return res.sendStatus(401)
    // await usersService.removeRefreshToken(userId, refreshToken)
    res.clearCookie('refreshToken')
    res.sendStatus(204)
}