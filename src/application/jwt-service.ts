import {usersService, UserType} from "../domain/users-service";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";
import {ObjectId} from "mongodb";
export type VerifiedToken = {
    userId: string
    iat: number
    exp: number
}
export const jwtService = {
    async createJWT(_id: ObjectId): Promise<string> {
        const token = jwt.sign({userId: _id}, settings.JWT_SECRET, {expiresIn: 10})
        return token
    },
    async createRefreshJWT(_id: ObjectId): Promise<string> {
        const refreshToken = jwt.sign({userId: _id}, settings.JWT_SECRET, {expiresIn: 20})
        const refreshTokenAdded = await usersService.addRefreshToken(_id, refreshToken)
        return refreshToken
    },
    async getUserIdByToken(token: string): Promise<ObjectId | null> {
        try {
            const result =  await jwt.verify(token, settings.JWT_SECRET) as VerifiedToken
            console.log(result)
            return new ObjectId(result.userId)
        } catch (e) {
            return null
        }
    }
}