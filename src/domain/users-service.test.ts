import 'reflect-metadata'
import {UsersService} from "./users-service";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";

import {EmailAdapter} from "../adapters/email-adapter";
import {EmailManager} from "../managers/email-manager";

import {JwtService} from "../application/jwt-service";
import {UsersRepository} from "../repository/users-repository";
import {UserModelClass} from "../repository/db";
import {ObjectId} from "mongodb";
import {addDays, addHours, addMinutes} from "date-fns";
import {randomUUID} from "node:crypto";

jest.setTimeout(100000)

describe("integration tests for users-service", () => {
    let mongoServer: MongoMemoryServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    const usersRepository = new UsersRepository()
    const emailAdapterMock: jest.Mocked<EmailAdapter> = {
        sendEmail: jest.fn(),
    }
    const emailManager = new EmailManager(emailAdapterMock)
    const jwtService = new JwtService()

    const usersService = new UsersService(usersRepository, emailManager, jwtService)
    const createUser = (confirmationCode: string, expirationDate: Date, email: string, isConfirmed: boolean, userName: string) => {
        return {
            _id: new ObjectId(),
            emailConfirmation: {
                confirmationCode: confirmationCode,
                expirationDate: expirationDate,
                isConfirmed: isConfirmed
            },
            accountData: {
                userName: userName,
                email: email,
                password: 'hash',
                createdAt: addDays(new Date(), -1),
                refreshTokens: ['refresh']
            }
        }
    }
    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })


    describe("createUser", () => {
        let user1Email = "dymich@dymich.com"
        let user1Login = "dymich"
        let busyLogin = user1Login
        let busyEmail = user1Email
        it("should return created user", async () => {
            let email = user1Email
            let login = user1Login
            const result = await usersService.createUser(login, email, "123")
            expect(result!.login).toBe(login)
        })
        it("should  return null, as user name is already in use", async () => {
            let email = "mail2@mail.ru"
            let login = busyLogin
            const result = await usersService.createUser(login, email, "123")
            expect(result).toBe(null)
        })
        it("should  return null, as email is already in use", async () => {
            let email = busyEmail
            let login = "alex2"
            const result = await usersService.createUser(login, email, "123")
            console.log(result)
            expect(result).toBe(null)
        })
        it(" this.emailManager.sendEmailConfirmationMessage should be called ", async () => {
            let email = "mail3@mail.ru"
            const result = await usersService.createUser("alex2", email, "123")
            expect(emailAdapterMock.sendEmail).toBeCalled()
        })
    })
    describe("confirmEmail", () => {
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
        })

        it('db should be empty', async () => {
            const count = await UserModelClass.countDocuments({})
            expect(count).toBe(0)
        })


        it("should return false for expired confirmation code", async () => {
            let user = createUser('supercode', addMinutes(new Date(), -1), 'confirm@mail.com', false, 'confirmEmailLogin');
            await UserModelClass.insertMany([user])
            const result = await usersService.confirmEmail("supercode")

            const userModel = await UserModelClass.findById(user._id)
            expect(userModel!.emailConfirmation.isConfirmed).toBeFalsy()

        })
        it("should return false for not existing confirmation code", async () => {
            let user = createUser(randomUUID(), addMinutes(new Date(), 1), randomUUID(), false, 'confirmEmailLogin');
            await UserModelClass.insertMany([user])
            const spy = jest.spyOn(usersRepository, 'updateConfirmation')
            const result = await usersService.confirmEmail(user.emailConfirmation.confirmationCode + 'trash')

            expect(spy).not.toBeCalled()
            expect(result).toBe(false)
        })
        it("should return false for confirmed account", async () => {
            const result = await usersService.confirmEmail("supercode2")
            expect(result).toBe(false)
        })
        it("should return true for existing and not expired confirmation code", async () => {
            let user = createUser('supercode3', addHours(new Date(), 1), 'emailik3@mail.com', false, "confirmEmailLogin3");
            await UserModelClass.insertMany([user])
            const result = await usersService.confirmEmail("supercode3")

            const userModel = await UserModelClass.findById(user._id)
            expect(userModel!.emailConfirmation.isConfirmed).toBeTruthy()
        })
    })
    describe("getUsers", () => {
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
        })
        it("should create 3 users and return them", async () => {
            let confCode = "confCode"
            let confCode2 = confCode + 2
            let confCode3 = confCode + 3
            let expDate = addHours(new Date(), 1)
            let email = "mail1@mail.com"
            let email2 = "mail2@mail.com"
            let email3 = "mail3@mail.com"
            const notConfirmed = false
            let userName = "name"
            let userName2 = userName + 2
            let userName3 = userName + 3

            let user1 = createUser(confCode, expDate, email, notConfirmed, userName)
            let user2 = createUser(confCode2, expDate, email2, notConfirmed, userName2)
            let user3 = createUser(confCode3, expDate, email3, notConfirmed, userName3)

            await UserModelClass.insertMany([user1, user2, user3])
            const result = await usersService.getUsers(1, 10)
            expect(result.items.length).toBe(3)

        })
    })

    describe("findUserById", () => {
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
        })
        it("should find user", async () => {
            let confCode = "confCode"
            let expDate = addHours(new Date(), 1)
            let email = "mail1@mail.com"
            const notConfirmed = false
            let userName = "name"
            let user1 = createUser(confCode, expDate, email, notConfirmed, userName)

            await UserModelClass.insertMany([user1])
            const result = await usersService.findUserById(user1._id)
            expect(result!.accountData.userName).toBe(userName)

        })
        it("should not find nonexistent user", async () => {
            const result = await usersService.findUserById(new ObjectId())
            expect(result).toBe(null)

        })
    })
    describe("findUserByLogin", () => {
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
        })
        it("should find user", async () => {
            let confCode = "confCode"
            let expDate = addHours(new Date(), 1)
            let email = "mail1@mail.com"
            const notConfirmed = false
            let userName = "name"
            let user1 = createUser(confCode, expDate, email, notConfirmed, userName)

            await UserModelClass.insertMany([user1])
            const result = await usersService.findByLogin(userName)
            expect(result!.accountData.userName).toBe(userName)

        })
        it("should not find nonexistent user", async () => {
            const result = await usersService.findByLogin('nonexistentLogin')
            expect(result).toBe(null)

        })
    })
    describe("deleteUser", () => {
        beforeAll(async () => {
            await mongoose.connection.db.dropDatabase()
        })
        it("should delete user", async () => {
            let confCode = "confCode"
            let expDate = addHours(new Date(), 1)
            let email = "mail1@mail.com"
            const notConfirmed = false
            let userName = "name"
            let user1 = createUser(confCode, expDate, email, notConfirmed, userName)

            await UserModelClass.insertMany([user1])
            const result = await usersService.deleteUser(user1._id.toString())
            expect(result).toBe(true)

        })
        it("should return false if try to delete nonexistent user", async () => {
            const result = await usersService.deleteUser(new ObjectId().toString())
            expect(result).toBe(false)

        })
    })
})
///