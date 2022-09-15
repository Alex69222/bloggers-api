import {MongoMemoryServer} from "mongodb-memory-server";
import {container} from "../composition-root";
import {QuizGameStatusType, QuizGameType, QuizService} from "./quiz-service";
import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {QuizModelClass} from "../repository/db";

describe("tests for quiz-service", () =>{
    let mongoServer: MongoMemoryServer
    const quizService = container.resolve(QuizService)
    const newQuizGame: QuizGameType = {
        _id: new ObjectId(),
        firstPlayer: {
            answers: [],
            user: {
                id: 'userId',
                login: 'userLogin'
            },
            score: 0
        },
        secondPlayer: null,
        questions: [
            {
                id: "6318c813d23780b968d85bbb",
                body: 'q5',
                answer: 'a5'
            },
            {
                id: "6318c813d23780b968d85bb9",
                body: 'q3',
                answer: 'a3'
            },
            {
                id: "6318c813d23780b968d85bbf",
                body: 'q9',
                answer: 'a9'
            },
            {
                id: "6318c813d23780b968d85bb8",
                body: 'q2',
                answer: 'a2'
            },
            {
                id: "6318c813d23780b968d85bb7",
                body: 'q1',
                answer: 'a1'
            }
        ],
        status: QuizGameStatusType.PendingSecondPlayer,
        pairCreatedDate: new Date(),
        startGameDate: null,
        finishGameDate: null
    }
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })
    describe("getMyCurrentGame", () =>{
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        // it("should return null, as there is no current game", async () =>{
        //     const res = await quizService.getMyCurrentGame("myId")
        //     expect(res).toBeNull()
        // })
        it("should return null, as there is no current game", async () =>{
            await quizService.createOrConnect("userId", "userLogin")
            await quizService.createOrConnect("userId2", "userLogin2")

            const res = await quizService.sendAnswer("userId", "answer")
            expect(res).toBeNull()
        })
    })
})