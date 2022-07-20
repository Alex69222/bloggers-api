import {UserType} from "../domain/users-service";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";
import {ObjectId} from "mongodb";

export const jwtService = {
    async createJWT(user: UserType): Promise<string> {
        const token = jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: '3h'})
        return token
    },
    async getUserIdByToken(token: string): Promise<ObjectId | null> {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch (e) {
            return null
        }
    }
}