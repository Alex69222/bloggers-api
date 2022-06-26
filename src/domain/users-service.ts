import {usersRepository} from "../repository/users-repository";
import  bcrypt from  'bcrypt'
import {ObjectId} from "mongodb";
import {transformToPaginationView} from "../helpers/transformToPaginationView";
export type UserType = {
    _id: ObjectId
    id: number
    login: string
    password: string
}

export const usersService = {
    async getUsers(PageNumber: number, PageSize: number){
        const {users, usersCount}= await usersRepository.getUsers(PageNumber, PageSize)
        return transformToPaginationView(usersCount, PageSize, PageNumber, users)
    },
    async findByLogin(login: string){
        return await usersRepository.findByLogin(login)
    },
    async findUserById(userId: ObjectId){
        return await usersRepository.findUserById(userId)
    },
    async createUser(login: string, password: string){
        const passwordSalt = await bcrypt.genSalt(11)
        const passwordHash = await bcrypt.hash(password, passwordSalt)

        const newUser: UserType = {
            _id: new ObjectId(),
            id: +(new Date()),
            login,
            password: passwordHash
        }
        const resultUser = await usersRepository.createUser(newUser)
        return {
            id: resultUser.id,
            login: resultUser.login
        }

    },
    async deleteUser(userId: number): Promise<boolean>{
        const userIsDeleted = await usersRepository.deleteUser(userId)
        return userIsDeleted
    },
    async checkCredentials (login: string, password: string): Promise<UserType | false>{
        const user = await usersRepository.findByLogin(login)
        if (!user) return false
        const passwordMatches = await bcrypt.compare(password, user.password)
        return passwordMatches ? user : false
    }

}