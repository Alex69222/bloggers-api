import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {container} from "../composition-root";
import {QuestionsRepository} from "./questions-repository";
import {IQuestion} from "../domain/questions-service";
import {ObjectId} from "mongodb";

jest.setTimeout(100000)
describe("tests for questions-repository", () => {
    let mongoServer: MongoMemoryServer
    const questionsRepository = container.resolve(QuestionsRepository)
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    describe("create question", () => {
        it("should return true after insertion of user", async () => {
            const newQuestion: IQuestion = {
                _id: new ObjectId(),
                body: '2 + 2',
                answer: '4'
            }
            const result = await questionsRepository.createQuestion(newQuestion)
            expect(result).toBe(true)
        })
    })
    describe("count questions", ()=>{
        it("should count all questions", async ()=>{
            const result = await questionsRepository.countQuestions()
            expect(typeof result).toBe('number')
        })
    })
    describe("get questions", ()=>{
        it("should get maximum 5 questions", async ()=>{
            const newQuestion: IQuestion = {
                _id: new ObjectId(),
                body: '2 + 2',
                answer: '4'
            }
            await questionsRepository.createQuestion(newQuestion)
            const result = await questionsRepository.getQuestions(5, 1)
            console.log(result)
            expect(result.length).toBeLessThanOrEqual(5)
        })
    })
})