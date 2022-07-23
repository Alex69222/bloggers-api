import {NextFunction, Request, Response} from "express";
import {jwtService,} from "../../application/jwt-service";
import {usersService} from "../../domain/users-service";
import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
import {settings} from "../../settings";

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.refreshToken) {
        res.sendStatus(401)
        return
    }
    const refreshToken = req.cookies.refreshToken
    const userId = await jwtService.getUserIdByToken(refreshToken)
    if (userId) {
        const oldRefreshTokenIsRemoved = await usersService.removeRefreshToken(userId, refreshToken)
        const userTokens = await usersService.getAllUserTokens(userId)
        const invalidTokens = []
        if (userTokens) {
            for (const t of userTokens) {
                try {
                    await jwt.verify(t, settings.JWT_SECRET);
                } catch (e) {
                    invalidTokens.push(t)
                }
            }
            if(userTokens.length){
                await usersService.removeManyTokens(userId,invalidTokens )
            }
        }
        req.user = await usersService.findUserById(userId)
        next()
    } else {
        return res.sendStatus(401)
    }
}