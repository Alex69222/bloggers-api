
import jwt from 'jsonwebtoken'
import {settings} from "../settings";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";

export type VerifiedToken = {
    userId: string
    iat: number
    exp: number
}

@injectable()
export class JwtService{
    constructor() {
    }
    async createJWT(_id: ObjectId): Promise<string> {
        const token = jwt.sign({userId: _id}, settings.JWT_SECRET, {expiresIn: '1h'})
        return token
    }
    async createRefreshJWT(_id: ObjectId): Promise<string> {
        const refreshToken = jwt.sign({userId: _id}, settings.JWT_SECRET, {expiresIn: '2h'})
        // const refreshTokenAdded = await this.usersService.addRefreshToken(_id, refreshToken)
        return refreshToken
    }
    async getUserIdByToken(token: string): Promise<ObjectId | null> {
        try {
            const result =  await jwt.verify(token, settings.JWT_SECRET) as VerifiedToken
            return new ObjectId(result.userId)
        } catch (e) {
            return null
        }
    }
}