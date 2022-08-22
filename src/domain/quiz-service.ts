import {inject, injectable} from "inversify";
import {QuizRepository} from "../repository/quiz-repository";

@injectable()
export class QuizService{
    constructor(@inject(QuizRepository) protected quizRepository: QuizRepository) {
    }
    async createOrConnect(){
        return 'create or connect - service'
    }
    async sendAnswer(){
        return 'answer is sent - service'
    }
    async getMyCurrentGame(){
        return 'current game - service'
    }
    async getGameById(){
        return 'game by id - service'
    }
    async getMyGames(){
        return 'my games - service'
    }
    async getTopUsers(){
        return 'top users - service'
    }
}