import {UsersService} from "./users-service";
import {container} from "../composition-root";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";

describe("integration tests for users-service" , async () => {
    const mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)

    const usersService = container.resolve(UsersService)
    describe("createUser", () => {
        it("should return ", async () => {
          const result = await usersService.createUser("alex", "mail@mail.ru", "123")
            if(result){
                expect(result?.login).toBe("alex")

            }
            else{
                expect(result).toBe(null)
            }
        })
    })
})