import {container} from "../composition-root";
import {QuizController} from "../controllers/quiz-controller";
import {Router} from "express";
import {authMiddleware} from "../middlewares/users/auth-middleware";

const quizController = container.resolve(QuizController)
export const quizRouter = Router({})
quizRouter.post('/pairs/connection', authMiddleware, quizController.createOrConnect.bind(quizController))
quizRouter.post('/pairs/my-current/answers', authMiddleware, quizController.sendAnswer.bind(quizController))
quizRouter.get('/pairs/my-current', authMiddleware, quizController.getMyCurrentGame.bind(quizController))
quizRouter.get('/pairs/:id', authMiddleware, quizController.getGameById.bind(quizController))
quizRouter.get('/pairs/my', authMiddleware, quizController.getMyGames.bind(quizController))
quizRouter.get('/users/top', quizController.getTopUsers.bind(quizController))

