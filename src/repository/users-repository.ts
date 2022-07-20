import {usersCollection} from "./db";
import {EmailConfirmationData, UserType} from "../domain/users-service";
import {ObjectId} from "mongodb";

export const usersRepository = {
    async getUsers(PageNumber: number, PageSize: number): Promise<{ usersCount: number, users: (Omit<UserType, '_id' | 'password'> & {id: string})[] }> {
        const usersCount = await usersCollection.count({})
        const users = await  usersCollection.aggregate<Omit<UserType, '_id' | 'password'> & {id: string}>([
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0, "password": 0}},
            {"$skip": (PageNumber - 1) * PageSize},
            {"$limit": PageSize}
        ]).toArray()
        return {users, usersCount}
    },
    async findByLogin(login: string): Promise<UserType | null> {
        return await usersCollection.findOne({'accountData.userName': login})
    },
    async findUserByEmail(email: string): Promise<UserType | null>{
        return await usersCollection.findOne({'accountData.email': email})
    },

    async findUserById(userId: ObjectId): Promise<Omit<UserType, '_id' | 'password'> & {id: string} | null> {
        const usersArr = await usersCollection.aggregate<Omit<UserType, "_id" | "password"> & {id: string}>([
            {"$match" : {_id: userId}},
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0}}
        ]).toArray()
        return usersArr[0] || null
    },
    async createUser(user: UserType): Promise<ObjectId | null> {
        const result = await usersCollection.insertOne(user)
        return result.insertedId || null
    },
    async deleteUser(userId: string): Promise<boolean> {
        if (!ObjectId.isValid(userId)) return false
        const userIsDeleted = await usersCollection.deleteOne({_id: new ObjectId(userId)})
        return userIsDeleted.deletedCount === 1
    },
    async findUserByConfirmationCode(code: string): Promise<UserType | null>{
        let user = usersCollection.findOne({'emailConfirmation.confirmationCode': code})
        return user
    },
    async updateConfirmation(_id: ObjectId):Promise<boolean>{
        const result = await usersCollection.updateOne({_id}, {"$set": {'emailConfirmation.isConfirmed' : true}})
        return result.modifiedCount === 1
    },
    async updateConfirmationData(_id: ObjectId, newConfirmationData:EmailConfirmationData):Promise<boolean>{
        const result = await usersCollection.updateOne({_id}, {"$set": {'emailConfirmation' : newConfirmationData}})
        return result.modifiedCount === 1
    }
}