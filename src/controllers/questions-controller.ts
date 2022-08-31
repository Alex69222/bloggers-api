import {inject, injectable} from "inversify";
import {IQuestion, QuestionsService} from "../domain/questions-service";
import {Request, Response} from "express";
import {body} from "express-validator";
import {PaginationType} from "../helpers/transformToPaginationView";
import {PaginationQueryType} from "../types/types";
import {pagePropsHandler} from "../helpers/pagePropsHandler";

@injectable()
export class QuestionsController {
    constructor(
        @inject(QuestionsService) protected questionsService: QuestionsService
    ) {
    }

    async getQuestions(req: Request<{},PaginationType<IQuestion>, {}, PaginationQueryType>,
                       res: Response<PaginationType<IQuestion>>) {
        const questions = await this.questionsService.getQuestions(...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.status(200).send(questions)
    }

    async createQuestion(req: Request<{}, null,{body: string, answer: string}, {}>, res: Response<null>) {
        const result = await this.questionsService.createQuestion( req.body.body,req.body.answer )
        if (!result) return res.sendStatus(400)
        res.sendStatus(201)
    }

    async getQuestionById() {

    }

    async deleteQuestionById() {

    }
}