import {NextFunction, Request, Response} from "express";
// import {jwtService,} from "../../application/jwt-service";
// import {usersService} from "../../domain/users-service";
import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import {settings} from "../../settings";
import {tokensBlackList} from "./revoke-refresh-token-middleware";
import {jwtService, usersService} from "../../composition-root";

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.refreshToken) {
        return res.sendStatus(401)
    }

    const refreshToken = req.cookies.refreshToken
    if (tokensBlackList[refreshToken]) {
        return res.sendStatus(401)
    }
    const userId = await jwtService.getUserIdByToken(refreshToken)
    tokensBlackList[refreshToken] = true
    console.log(tokensBlackList)
    if (userId) {
        // const oldRefreshTokenIsRemoved = await usersService.removeRefreshToken(userId, refreshToken)
        // const userTokens = await usersService.getAllUserTokens(userId)
        // const invalidTokens = []
        // if (userTokens) {
        //     for (const t of userTokens) {
        //         try {
        //             await jwt.verify(t, settings.JWT_SECRET);
        //         } catch (e) {
        //             invalidTokens.push(t)
        //         }
        //     }
        //     if (userTokens.length) {
        //         await usersService.removeManyTokens(userId, invalidTokens)
        //     }
        // }
        req.user = await usersService.findUserById(userId)
        next()
    } else {
        return res.sendStatus(401)
    }
}

