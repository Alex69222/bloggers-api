import {MongoMemoryServer} from "mongodb-memory-server";
import {container} from "../composition-root";
import {QuizRepository} from "./quiz-repository";
import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {AnswerStatusType, AnswerType, QuizGameStatusType, QuizGameType} from "../domain/quiz-service";
import {QuizModelClass} from "./db";

describe("tests for quiz-repository", () => {

    let mongoServer: MongoMemoryServer
    const quizRepository = container.resolve(QuizRepository)
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

    describe("find game with status: Pending second player", () => {
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should  return  null, as there is no games", async () => {
            const res = await quizRepository.findPendingSecondPlayerGame()
            expect(res).toBe(null)
        })
        it("should return game with status: pending second player", async () => {
            await quizRepository.createNewQuizGame(newQuizGame)
            const res: any = await quizRepository.findPendingSecondPlayerGame()
            expect(res).toMatchObject(newQuizGame)
        })
    })
    describe("create new Quiz game", () => {
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should create new game", async () => {

            await quizRepository.createNewQuizGame(newQuizGame)
            const res = await quizRepository.findPendingSecondPlayerGame()
            expect(res).toBeTruthy()
        })
    })
    describe("connect to game with status: Pending second player", () => {
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should not connect, as there is no pending game", async () => {
            const res = await quizRepository.connectToExistingGame(new ObjectId(), "userId", "userLogin")
            expect(res).toBe(null)
        })

        it("should connect to pending second player game and create new pair", async () => {
            const game = await quizRepository.createNewQuizGame(newQuizGame) as QuizGameType
            const res = await quizRepository.connectToExistingGame(game._id, "userId1", "userLogin1") as QuizGameType
            expect(res).toBeTruthy()
            expect(res.status).toBe(QuizGameStatusType.Active)
        })
    })
    describe("tests for getMyCurrentGame repository method", () => {
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should return null, as there is no current game", async () => {
            const res = await quizRepository.getMyCurrentGame("myId")
            expect(res).toBeNull()
        })
        it("should return the game with user as first player and status: Pending for second player", async () => {
            await quizRepository.createNewQuizGame(newQuizGame)
            const res = await quizRepository.getMyCurrentGame(newQuizGame.firstPlayer.user.id) as QuizGameType
            expect(res.status).toBe(QuizGameStatusType.PendingSecondPlayer)
            expect(res.firstPlayer.user.id).toBe(newQuizGame.firstPlayer.user.id)
        })
        it("should return the game with user as second player and status: Active", async () => {
            const game = await quizRepository.createNewQuizGame(newQuizGame)
            if (!game) {
                expect(game).not.toBeNull()
                return
            }
            await quizRepository.connectToExistingGame(game._id, "userId1", "userLogin1")
            const res = await quizRepository.getMyCurrentGame("userId1") as QuizGameType
            expect(res.status).toBe(QuizGameStatusType.Active)
            expect(res.secondPlayer).not.toBeNull()
            expect(res.secondPlayer!.user.id).toBe("userId1")
        })
        it("should return null, as game status is :finished", async () => {
            await QuizModelClass.insertMany([{
                _id: new ObjectId(),
                firstPlayer: {
                    answers: [],
                    user: {
                        id: 'userId',
                        login: 'userLogin'
                    },
                    score: 0
                },
                secondPlayer: {
                    answers: [],
                    user: {
                        id: 'userId1',
                        login: 'userLogin1'
                    },
                    score: 0
                },
                questions: [
                    {
                        _id: new ObjectId("6318c813d23780b968d85bbb"),
                        body: 'q5',
                        answer: 'a5'
                    },
                    {
                        _id: new ObjectId("6318c813d23780b968d85bb9"),
                        body: 'q3',
                        answer: 'a3'
                    },
                    {
                        _id: new ObjectId("6318c813d23780b968d85bbf"),
                        body: 'q9',
                        answer: 'a9'
                    },
                    {
                        _id: new ObjectId("6318c813d23780b968d85bb8"),
                        body: 'q2',
                        answer: 'a2'
                    },
                    {
                        _id: new ObjectId("6318c813d23780b968d85bb7"),
                        body: 'q1',
                        answer: 'a1'
                    }
                ],
                status: QuizGameStatusType.Finished,
                pairCreatedDate: new Date(),
                startGameDate: null,
                finishGameDate: null
            }])
            const res1 = await quizRepository.getMyCurrentGame("userId1")
            const res2 = await quizRepository.getMyCurrentGame("userId")
            expect(res1).toBeNull()
            expect(res2).toBeNull()
        })
    })
    describe("tests for getGameById repository method", () => {
        afterEach(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should return null as there is no game with this id", async () => {
            const id = new ObjectId()
            const res = await quizRepository.getGameById(id)
            expect(res).toBeNull()
        })
        it("should return game by id", async () => {
            await QuizModelClass.insertMany(newQuizGame)
            const res = await quizRepository.getGameById(newQuizGame._id)
            expect(res).toBeTruthy()
            expect(res!._id.toString()).toBe(newQuizGame._id.toString())
        })
    })
    describe("updateInGameUserScores", () => {
        beforeAll(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should return null, as there is no such game", async () => {
            const res = await quizRepository.updateInGameUserScores(newQuizGame._id, "firstPlayer", 10)
            expect(res).toBeNull()
        })
        it("should add 10 scores to firstPlayer", async () => {
            const game = await quizRepository.createNewQuizGame(newQuizGame) as QuizGameType
            const res = await quizRepository.updateInGameUserScores(game._id, "firstPlayer", 10)
            expect(res!.firstPlayer.score).toBe(10)
        })
    })

})