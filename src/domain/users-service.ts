import {usersRepository} from "../repository/users-repository";
import bcrypt from 'bcrypt'
import {ObjectId} from "mongodb";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {v4 as uuidv4} from 'uuid'
import add from 'date-fns/add'
import {emailManager} from "../managers/email-manager";

export type EmailConfirmationData = {
    confirmationCode: string,
    expirationDate: Date
    isConfirmed: boolean
}
export type UserType = {
    _id: ObjectId
    accountData: {
        userName: string
        email: string
        password: string
        createdAt: Date
        refreshTokens: Array<string>
    }
    emailConfirmation: EmailConfirmationData
}

export const usersService = {
    async getUsers(PageNumber: number, PageSize: number): Promise<PaginationType<Omit<UserType, '_id' | 'password'> & { id: string }>> {
        const {users, usersCount} = await usersRepository.getUsers(PageNumber, PageSize)
        return transformToPaginationView<Omit<UserType, '_id' | 'password'> & { id: string }>(usersCount, PageSize, PageNumber, users)
    },
    async findByLogin(login: string): Promise<UserType | null> {
        return await usersRepository.findByLogin(login)
    },
    async findUserById(userId: ObjectId): Promise<Omit<UserType, '_id' | 'password'> & { id: string } | null> {
        return await usersRepository.findUserById(userId)
    },
    async createUser(login: string, email: string, password: string): Promise<{ id: string, login: string } | null> {
        const passwordSalt = await bcrypt.genSalt(11)
        const passwordHash = await bcrypt.hash(password, passwordSalt)

        const newUser: UserType = {
            _id: new ObjectId(),
            accountData: {
                userName: login,
                email,
                password: passwordHash,
                createdAt: new Date(),
                refreshTokens: []
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30
                }),
                isConfirmed: false
            }
        }
        const insertedId = await usersRepository.createUser(newUser)
        if (!insertedId) return null
        const {accountData, ...createdUser} = newUser
        try {
            await emailManager.sendEmailConfirmationMessage(newUser)
            return {
                login: accountData.userName,
                id: insertedId.toString()
            }
        } catch (err) {
            console.log(err)
            await usersRepository.deleteUser(newUser._id.toString())
            return null
        }


    },
    async deleteUser(userId: string): Promise<boolean> {
        const userIsDeleted = await usersRepository.deleteUser(userId)
        return userIsDeleted
    },
    async checkCredentials(login: string, password: string): Promise<UserType | false> {
        const user = await usersRepository.findByLogin(login)
        if (!user) return false
        if (!user.emailConfirmation.isConfirmed) return false
        const passwordMatches = await bcrypt.compare(password, user.accountData.password)
        return passwordMatches ? user : false
    },
    async confirmEmail(code: string): Promise<boolean> {
        let user = await usersRepository.findUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        let result = await usersRepository.updateConfirmation(user._id)
        return result
    },
    async findUserByEmail(email: string): Promise<UserType | null> {
        let user = await usersRepository.findUserByEmail(email)
        return user
    },
    async resendConfirmationEmail(email: string):Promise<boolean> {
        const user = await this.findUserByEmail(email)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        const newEmailConfirmationData = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30
            }),
            isConfirmed: false
        }
        const confirmationDataIsUpdated = await usersRepository.updateConfirmationData(user._id, newEmailConfirmationData)
        if (!confirmationDataIsUpdated) return false
        const {emailConfirmation, ...restOfUser} = user

        try {
            await emailManager.sendEmailConfirmationMessage({
                ...restOfUser,
                emailConfirmation: newEmailConfirmationData
            })
            return true
        } catch (err) {
            return false
        }
    },
    async addRefreshToken(_id: ObjectId, refreshToken: string): Promise<boolean>{
        const result = await usersRepository.addRefreshToken(_id, refreshToken)
        return result
    },
    async removeRefreshToken(_id: ObjectId, refreshToken: string): Promise<boolean>{
        const result = await usersRepository.removeRefreshToken(_id, refreshToken)
        return result
    },
    async removeManyTokens(_id: ObjectId, tokensArray: Array<string>): Promise<boolean>{
        const result = await usersRepository.removeManyRefreshTokens(_id, tokensArray)
        return result
    },
    async getAllUserTokens(_id: ObjectId,): Promise<Array<string> | null>{
        const tokens = await usersRepository.getAllUserTokens(_id)
        return tokens || null
    }


}