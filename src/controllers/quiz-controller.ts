import {inject, injectable} from "inversify";
import {QuizService} from "../domain/quiz-service";

@injectable()
export class QuizController{
    constructor(@inject(QuizService) protected quizService: QuizService) {
    }
    async createOrConnect(){
        return 'create or connect - controller'
    }
    async sendAnswer(){
        return 'answer is sent - controller'
    }
    async getMyCurrentGame(){
        return 'current game - controller'
    }
    async getGameById(){
        return 'game by id - controller'
    }
    async getMyGames(){
        return 'my games - controller'
    }
    async getTopUsers(){
        return 'top users - controller'
    }

}