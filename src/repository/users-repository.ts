import {UserModelClass, usersCollection} from "./db";
import {EmailConfirmationData, UserType} from "../domain/users-service";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {idMapper} from "../helpers/id-mapper";

@injectable()
export class UsersRepository {
    async getUsers(PageNumber: number, PageSize: number): Promise<{ usersCount: number, users: (Omit<UserType, '_id' | 'password'> & {id: string})[] }> {
        const usersCount = await UserModelClass.count({})
        const users = await UserModelClass.aggregate().project({
            login: '$accountData.userName',
            id: '$_id',
            _id: 0
        }).skip((PageNumber - 1) * PageSize).limit(PageSize)

        return {users, usersCount}
    }
    async findByLogin(login: string): Promise<UserType | null> {
        return UserModelClass.findOne({'accountData.userName': login});
    }
    async findUserByEmail(email: string): Promise<UserType | null>{
        return UserModelClass.findOne({'accountData.email': email});
    }

    async findUserById(userId: ObjectId): Promise<Omit<UserType, '_id' | 'password'> & {id: string} | null> {
        console.log(userId)
        const dbUser = await UserModelClass.findById(userId).lean()
        // asda
        const user = idMapper(dbUser)
        return user || null
    }
    async createUser(user: UserType): Promise<ObjectId | null> {
        try {
            const userInstance =  new UserModelClass(user)
            await userInstance.save()
            return userInstance._id
        }catch (e){
            return null
        }
    }
    async deleteUser(userId: string): Promise<boolean> {
        if (!ObjectId.isValid(userId)) return false
        const deleteResult = await UserModelClass.findByIdAndDelete(new ObjectId(userId))
        if(!deleteResult) return false
        return true
    }
    async findUserByConfirmationCode(code: string): Promise<UserType | null>{
        let user = await UserModelClass.findOne({'emailConfirmation.confirmationCode': code}).lean()
        return user
    }
    async updateConfirmation(_id: ObjectId):Promise<boolean>{
        const result = await UserModelClass.updateOne({_id}, {'emailConfirmation.isConfirmed' : true})
        return result.modifiedCount === 1
    }
    async updateConfirmationData(_id: ObjectId, newConfirmationData:EmailConfirmationData):Promise<boolean>{
        const result = await UserModelClass.updateOne({_id}, {'emailConfirmation' : newConfirmationData})
        return result.modifiedCount === 1
    }
    // dfs
    // async addRefreshToken(_id: ObjectId, token: string): Promise<boolean>{
    //     const result = await usersCollection.findOneAndUpdate({_id}, {$push: {'accountData.refreshTokens': token}})
    //     return !!result.ok
    // }
    async removeRefreshToken(_id: ObjectId, token: string): Promise<boolean>{
        const result = await usersCollection.findOneAndUpdate({_id}, {$pull: {'accountData.refreshTokens': token}})
        return !!result.ok
    }
    async removeManyRefreshTokens(_id: ObjectId, tokensArray: Array<string>): Promise<boolean>{
        const result = await usersCollection.findOneAndUpdate({_id},
            {$pull: {'accountData.refreshTokens': {'$in': tokensArray}}})
        return !!result.ok
    }
    async getAllUserTokens(_id: ObjectId): Promise<Array<string> | null>{
        const result = await usersCollection.findOne({_id}, {projection: {'accountData.refreshTokens': 1, _id: 0}})
        return result?.accountData.refreshTokens || null
    }
}
// export const usersRepository = new UsersRepository()