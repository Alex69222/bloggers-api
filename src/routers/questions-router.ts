import {Router} from "express";
import {container} from "../composition-root";
import {QuestionsController} from "../controllers/questions-controller";

export const questionsRouter = Router({})
const questionsController = container.resolve(QuestionsController)

questionsRouter.get('/', questionsController.getQuestions.bind(questionsController))
questionsRouter.post('/', questionsController.createQuestion.bind(questionsController))
questionsRouter.get('/:id', questionsController.getQuestionById.bind(questionsController))
questionsRouter.delete('/:id', questionsController.deleteQuestionById.bind(questionsController))