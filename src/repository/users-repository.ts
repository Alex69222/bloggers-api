import {usersCollection} from "./db";
import {UserType} from "../domain/users-service";
import {ObjectId} from "mongodb";

export const usersRepository = {
    async getUsers(PageNumber: number, PageSize: number) {
        const usersCount = await usersCollection.count({})
        const users = await usersCollection
            .find({})
            .skip((PageNumber - 1) * PageSize)
            .limit(PageSize)
            .project({_id:0, password: 0})
            .toArray()
        return {users, usersCount}
    },
    async findByLogin(login: string):Promise<UserType | null>{
        return await usersCollection.findOne({login: login})
    },
    async findUserById(userId: ObjectId):Promise<UserType | null>{
        return await usersCollection.findOne({_id: userId})
    },
    async createUser(user: UserType): Promise<UserType> {
        await usersCollection.insertOne(user)
        return user
    },
    async deleteUser(userId: string): Promise<boolean> {
            const userIsDeleted = await usersCollection.deleteOne({id: userId})
        return userIsDeleted.deletedCount === 1
    }
}