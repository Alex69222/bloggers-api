import {MongoMemoryServer} from "mongodb-memory-server";
import {container} from "../composition-root";
import {AnswerStatusType, QuizGameStatusType, QuizGameType, QuizService} from "./quiz-service";
import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {QuestionModelClass, QuizModelClass} from "../repository/db";
import {FORBIDDEN} from "../helpers/constants";

describe("tests for quiz-service", () => {
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
                body: 'q1',
                answer: 'a1'
            },
            {
                id: "6318c813d23780b968d85bb9",
                body: 'q2',
                answer: 'a2'
            },
            {
                id: "6318c813d23780b968d85bbf",
                body: 'q3',
                answer: 'a3'
            },
            {
                id: "6318c813d23780b968d85bb8",
                body: 'q4',
                answer: 'a4'
            },
            {
                id: "6318c813d23780b968d85bb7",
                body: 'q5',
                answer: 'a5'
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

    describe("createOrConnect", () => {
        beforeAll(async () => {
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
        afterAll(async () => {
            await QuizModelClass.deleteMany({})
        })

        it("should create new game with status: Pending for second player", async () => {
            const res = await quizService.createOrConnect("userId", "userLogin")
            expect(res!.firstPlayer.user.id).toBe("userId")
            expect(res!.status).toBe(QuizGameStatusType.PendingSecondPlayer)
            expect(res!.secondPlayer).toBe(null)
            expect(res!.pairCreatedDate).not.toBeNull()
            expect(res!.startGameDate).toBeNull()
            expect(res!.finishGameDate).toBeNull()
            expect(res!.questions.length).toBeTruthy()
        })
        it("should return null as this player is already participating in game with active or panding status", async () => {
                const res = await quizService.createOrConnect("userId", "userLogin")
                expect(res).toBeNull()
            }
        )
        it("should connect to existing game and return it with status: Active", async () => {
            const res = await quizService.createOrConnect("userId2", "userLogin2")
            expect(res!.firstPlayer.user.id).toBe("userId")
            expect(res!.secondPlayer!.user.id).toBe("userId2")
            expect(res!.pairCreatedDate).not.toBeNull()
            expect(res!.startGameDate).not.toBeNull()
            expect(res!.finishGameDate).toBeNull()
            expect(res!.status).toBe(QuizGameStatusType.Active)
        })
        it("should create  another game with status: Pending for second player", async () => {
            const res = await quizService.createOrConnect("userId3", "userLogin3")
            expect(res!.firstPlayer.user.id).toBe("userId3")
            expect(res!.status).toBe(QuizGameStatusType.PendingSecondPlayer)
            expect(res!.secondPlayer).toBe(null)
            expect(res!.questions.length).toBeTruthy()
            expect(res!.pairCreatedDate).not.toBeNull()
            expect(res!.startGameDate).toBeNull()
            expect(res!.finishGameDate).toBeNull()
        })


    })
    describe("getMyCurrentGame", () => {
        afterAll(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should return null, as there is no current game", async () => {
            const res = await quizService.getMyCurrentGame("myId")
            expect(res).toBeNull()
        })
        it("should return current game with status: Pending for second player", async () => {
            await quizService.createOrConnect("myId", "myLogin")
            const res = await quizService.getMyCurrentGame("myId")
            expect(res!.firstPlayer.user.id).toBe("myId")
            expect(res!.status).toBe(QuizGameStatusType.PendingSecondPlayer)
            expect(res!.secondPlayer).toBe(null)
            expect(res!.pairCreatedDate).not.toBeNull()
            expect(res!.startGameDate).toBeNull()
            expect(res!.finishGameDate).toBeNull()
            expect(res!.questions.length).toBe(0)
        })
        it("should return current game with status: Active", async () => {
            await quizService.createOrConnect("myId2", "myLogin2")
            const res = await quizService.getMyCurrentGame("myId2")
            expect(res!.firstPlayer.user.id).toBe("myId")
            expect(res!.secondPlayer!.user.id).toBe("myId2")
            expect(res!.pairCreatedDate).not.toBeNull()
            expect(res!.startGameDate).not.toBeNull()
            expect(res!.finishGameDate).toBeNull()
            expect(res!.status).toBe(QuizGameStatusType.Active)
            expect(res!.questions.length).toBe(1)
        })
        it("should return null as the game has status Finished and cannot be current game any more", async () => {
            const id = new ObjectId()
            const anotherGame = {...newQuizGame, _id: id, status: QuizGameStatusType.Finished}
            // const anotherGame = {...JSON.parse(JSON.stringify(newQuizGame)),_id: id, status: QuizGameStatusType.Finished }
            await QuizModelClass.insertMany([anotherGame])
            const res = await quizService.getMyCurrentGame("userId")
            expect(res).toBeNull()

        })
        it("should not return questions if game has status is Pending second Player and " +
            "should return only already answered questions + next one", async () => {
            await QuizModelClass.deleteMany({})

            await QuizModelClass.insertMany([newQuizGame])
            const res = await quizService.getMyCurrentGame("userId")
            expect(res!.status).toBe(QuizGameStatusType.PendingSecondPlayer)
            expect(res!.questions.length).toBe(0)

            await quizService.createOrConnect("myId3", "myLogin3")

            const res2 = await quizService.getMyCurrentGame("userId")
            expect(res2!.status).toBe(QuizGameStatusType.Active)
            expect(res2!.questions.length).toBe(1)

            await quizService.sendAnswer("userId", "a1")
            const res3 = await quizService.getMyCurrentGame("userId")
            // console.log(res3!)
            // console.log(res3!.questions)
            // console.log(res3!.firstPlayer.answers)
            expect(res3!.questions.length).toBe(2)

            await quizService.sendAnswer("userId", "a2")
            const res4 = await quizService.getMyCurrentGame("userId")
            expect(res4!.questions.length).toBe(3)

            await quizService.sendAnswer("userId", "a3")
            const res5 = await quizService.getMyCurrentGame("userId")
            expect(res5!.questions.length).toBe(4)

            await quizService.sendAnswer("userId", "a4")
            const res6 = await quizService.getMyCurrentGame("userId")
            console.log(res6!.questions)
            expect(res6!.questions.length).toBe(5)

            await quizService.sendAnswer("userId", "a5")
            const res7 = await quizService.getMyCurrentGame("userId")
            expect(res7!.questions.length).toBe(5)

        })

    })
    describe("sendAnswer", () => {

        describe("first player finishes first and get extra score scenario", () => {
            beforeAll(async () => {
                // firstPlayer id: 'userId', login: 'userLogin'
                await QuizModelClass.insertMany([newQuizGame])
                await quizService.createOrConnect("userId2", "userLogin2")
            })
            afterAll(async () => {
                await QuizModelClass.deleteMany({})
            })
            it("should return null, as there is no active game for current user", async () => {
                const res = await quizService.sendAnswer("userId999", "a1")
                expect(res).toBeNull()
            })
            it("should add correct answer and add 1 score point to the firstPlayer", async () => {
                await quizService.sendAnswer("userId", "a1")
                const res = await quizService.getMyCurrentGame("userId")
                expect(res!.status).toBe(QuizGameStatusType.Active)
                expect(res!.firstPlayer.user.id).toBe("userId")
                expect(res!.secondPlayer!.user.id).toBe("userId2")
                expect(res!.firstPlayer.answers.length).toBe(1)
                expect(res!.firstPlayer.answers[0].answerStatus).toBe(AnswerStatusType.Correct)
                expect(res!.firstPlayer.score).toBe(1)

            })
            it("should add correct answer and add 1 score point to the secondPlayer", async () => {
                await quizService.sendAnswer("userId2", "a1")
                const res = await quizService.getMyCurrentGame("userId2")
                expect(res!.status).toBe(QuizGameStatusType.Active)
                expect(res!.firstPlayer.user.id).toBe("userId")
                expect(res!.secondPlayer!.user.id).toBe("userId2")
                expect(res!.firstPlayer.answers.length).toBe(1)
                expect(res!.secondPlayer!.answers.length).toBe(1)
                expect(res!.firstPlayer.answers[0].answerStatus).toBe(AnswerStatusType.Correct)
                expect(res!.secondPlayer!.answers[0].answerStatus).toBe(AnswerStatusType.Correct)
                expect(res!.firstPlayer.score).toBe(1)
                expect(res!.secondPlayer!.score).toBe(1)

            })
            it("first player answers last 4 questions and gets 6 scores in total (with extra score)", async () => {
                await quizService.sendAnswer("userId", "a2")
                await quizService.sendAnswer("userId", "a3")
                await quizService.sendAnswer("userId", "a4")
                await quizService.sendAnswer("userId", "a5")
                const res = await quizService.getMyCurrentGame("userId")
                expect(res!.firstPlayer.answers.length).toBe(res!.questions.length)
                expect(res!.firstPlayer.score).toBe(6)
            })
            it("should return null as the first player has already answered all the questions", async () => {
                const res = await quizService.sendAnswer("userId", "a2")
                expect(res).toBeNull()
            })
            it("secondPlayer should answer the second question incorrectly", async () => {
                await quizService.sendAnswer("userId2", "a0")
                const res = await quizService.getMyCurrentGame("userId2")
                expect(res!.secondPlayer!.answers.length).toBe(2)
                expect(res!.secondPlayer!.answers[1].answerStatus).toBe(AnswerStatusType.Incorrect)
                expect(res!.secondPlayer!.score).toBe(1)
            })
            it("second player should answer other questions incorrectly and game's status should be changed for: Finished", async () => {
                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")
                const currGame = await quizService.getMyCurrentGame("userId2")
                expect(currGame).toBeNull()
                const finishedGame = await quizService.getGameById(newQuizGame._id, "userId2") as QuizGameType
                expect(finishedGame!.status).toBe(QuizGameStatusType.Finished)
                expect(finishedGame!.secondPlayer!.answers.length).toBe(finishedGame!.questions.length)
                expect(finishedGame!.finishGameDate).not.toBeNull()
                expect(finishedGame!.secondPlayer?.score).toBe(1)

            })
        })
        describe("sendAnswers scenarios", () => {
            beforeEach(async () => {
                // firstPlayer id: 'userId', login: 'userLogin'
                await QuizModelClass.insertMany([newQuizGame])
                await quizService.createOrConnect("userId2", "userLogin2")
            })
            afterEach(async () => {
                await QuizModelClass.deleteMany({})
            })
            it("firstPlayer answers only one question correctly, but finishes first and gets one extra score", async () => {
                await quizService.sendAnswer("userId", "a1")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")

                await quizService.sendAnswer("userId2", "a1")
                await quizService.sendAnswer("userId2", "a2")
                await quizService.sendAnswer("userId2", "a3")
                await quizService.sendAnswer("userId2", "a4")
                await quizService.sendAnswer("userId2", "a5")

                const res = await quizService.getGameById(newQuizGame._id, "userId") as QuizGameType
                expect(res!.status).toBe(QuizGameStatusType.Finished)
                expect(res!.firstPlayer.score).toBe(2)
                expect(res!.secondPlayer!.score).toBe(5)
            })
            it("firstPlayer answers none questions correctly, finishes first  and doesn't gets  extra score", async () => {
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")

                await quizService.sendAnswer("userId2", "a1")
                await quizService.sendAnswer("userId2", "a2")
                await quizService.sendAnswer("userId2", "a3")
                await quizService.sendAnswer("userId2", "a4")
                await quizService.sendAnswer("userId2", "a5")

                const res = await quizService.getGameById(newQuizGame._id, "userId") as QuizGameType
                expect(res!.status).toBe(QuizGameStatusType.Finished)
                expect(res!.firstPlayer.score).toBe(0)
                expect(res!.secondPlayer!.score).toBe(5)
            })

            it("no one gets extra score", async () => {
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")
                await quizService.sendAnswer("userId", "a0")

                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")
                await quizService.sendAnswer("userId2", "a0")

                const res = await quizService.getGameById(newQuizGame._id, "userId") as QuizGameType
                expect(res!.status).toBe(QuizGameStatusType.Finished)
                expect(res!.firstPlayer.score).toBe(0)
                expect(res!.secondPlayer!.score).toBe(0)
            })
        })
    })
    describe("getMyGames", () => {
        afterAll(async () => {
            await QuizModelClass.deleteMany({})
        })
        it("should return pagination object with empty array, as there were no games with this user", async () => {
            const res = await quizService.getMyGames("userId", 1, 10)
            expect(res.page).toBe(1)
            expect(res.items.length).toBe(0)
            expect(res.totalCount).toBe(0)
            expect(res.pageSize).toBe(10)
            expect(res.pagesCount).toBe(0)
        })
        it("should return pagination object with one game in items array", async () => {
            await quizService.createOrConnect("userId", "userLogin")
            const res = await quizService.getMyGames("userId", 1, 10)
            expect(res.page).toBe(1)
            expect(res.items.length).toBe(1)
            expect(res.totalCount).toBe(1)
            expect(res.pageSize).toBe(10)
            expect(res.pagesCount).toBe(1)
        })
        it("should return pagination object with two games in items array", async () => {
            await quizService.createOrConnect("userId2", "userLogin2")
            await quizService.sendAnswer("userId", "a1")
            await quizService.sendAnswer("userId", "a0")
            await quizService.sendAnswer("userId", "a0")
            await quizService.sendAnswer("userId", "a0")
            await quizService.sendAnswer("userId", "a0")

            await quizService.sendAnswer("userId2", "a1")
            await quizService.sendAnswer("userId2", "a2")
            await quizService.sendAnswer("userId2", "a3")
            await quizService.sendAnswer("userId2", "a4")
            await quizService.sendAnswer("userId2", "a5")

            await quizService.createOrConnect("userId", "userLogin")
            await quizService.createOrConnect("userId2", "userLogin2")

            const res = await quizService.getMyGames("userId", 1, 10)
            expect(res.page).toBe(1)
            expect(res.items.length).toBe(2)
            expect(res.totalCount).toBe(2)
            expect(res.pageSize).toBe(10)
            expect(res.pagesCount).toBe(1)
            expect(res.items[1].questions.length).toBe(1)
            // console.log(res.items[0].questions)
        })

    })
    describe("getGameById", ()=>{
        afterAll(async ()=>{
            QuizModelClass.deleteMany({})
        })
        it("should return null, as there is no game with that id", async () =>{
            const res = await quizService.getGameById(new ObjectId(), "userId")
            expect(res).toBeNull()
        })
        it("should return existing game", async () =>{
            await QuizModelClass.insertMany([newQuizGame])
            await quizService.createOrConnect("userId2", "userLogin2")
            await quizService.sendAnswer("userId", "a1")
            await quizService.sendAnswer("userId", "a2")
            const res = await quizService.getGameById(newQuizGame._id, "userId") as QuizGameType
            console.log(res!.questions)
            expect(res!.firstPlayer.user.id).toBe("userId")
        })
        it("should return string: FORBIDDEN, as the user didn't take part in the game", async () =>{
            const res = await quizService.getGameById(newQuizGame._id, "user555")
            expect(res).toBe(FORBIDDEN)
        })
    })

})
