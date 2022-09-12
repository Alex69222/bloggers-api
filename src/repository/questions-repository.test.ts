import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {container} from "../composition-root";
import {QuestionsRepository} from "./questions-repository";
import {IQuestion} from "../domain/questions-service";
import {ObjectId} from "mongodb";
import {QuestionModelClass} from "./db";

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
    describe("count questions", () => {
        it("should count all questions", async () => {
            const result = await questionsRepository.countQuestions()
            expect(typeof result).toBe('number')
        })
    })
    describe("get questions", () => {
        it("should get maximum 5 questions", async () => {
            const newQuestion: IQuestion = {
                _id: new ObjectId(),
                body: '3 + 3',
                answer: '6'
            }
            await questionsRepository.createQuestion(newQuestion)
            const result = await questionsRepository.getQuestions(1, 5)
            expect(result.length).toBeLessThanOrEqual(5)
        })
    })
    describe("get question by id", () => {
        it("should return question by id", async () => {
            const id = new ObjectId()
            const question: IQuestion = {_id: id, body: 'my name', answer: 'Alex'}
            await questionsRepository.createQuestion(question)
            const result = await questionsRepository.getQuestionById(id)
            expect(result!.body).toBe('my name')
            expect(result!.answer).toBe('Alex')
        })
        it("should return null as it cant find nonexistent question", async () => {
            const id = new ObjectId()
            const result = await questionsRepository.getQuestionById(id)
            expect(result).toBe(null)
        })
    })
    describe("delete question by id", () => {
        it("should delete question by id", async () => {
            const id = new ObjectId()
            await questionsRepository.createQuestion({_id: id, body: 'new q', answer: 'answer'})
            const res = await questionsRepository.deleteQuestionById(id)
            expect(res!._id.toString()).toBe(id.toString())

        })
        it("should return null as it is impossible to delete nonexistent  question", async () => {
            const id = new ObjectId()
            const res = await questionsRepository.deleteQuestionById(id)
            expect(res).toBe(null)
        })
    })
    describe("return provided amount of random questions", () => {
        beforeAll(async () => {
            await QuestionModelClass.collection.drop()
            await QuestionModelClass.insertMany([
                {_id: new ObjectId(), body: 'q1', answer: 'a1'},
                {_id: new ObjectId(), body: 'q2', answer: 'a2'},
                {_id: new ObjectId(), body: 'q3', answer: 'a3'},
                {_id: new ObjectId(), body: 'q4', answer: 'a4'},
                {_id: new ObjectId(), body: 'q5', answer: 'a5'},
                {_id: new ObjectId(), body: 'q6', answer: 'a6'},
                {_id: new ObjectId(), body: 'q7', answer: 'a7'},
                {_id: new ObjectId(), body: 'q8', answer: 'a8'},
                {_id: new ObjectId(), body: 'q9', answer: 'a9'},
                {_id: new ObjectId(), body: 'q10', answer: 'a10'},
                {_id: new ObjectId(), body: 'q11', answer: 'a11'},
                {_id: new ObjectId(), body: 'q12', answer: 'a12'},
            ])
        })
        it("should return 5 random questions", async ()=>{
            const res = await questionsRepository.getRandomQuestions(3)
            expect(Array.isArray(res)).toBe(true)
        })

    })
})