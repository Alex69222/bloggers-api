import {injectable} from "inversify";

@injectable()
export class QuizRepository{
    async createOrConnect(){
        return 'create or connect - repo'
    }
    async sendAnswer(){
        return 'answer is sent - repo'
    }
    async getMyCurrentGame(){
        return 'current game - repo'
    }
    async getGameById(){
        return 'game by id - repo'
    }
    async getMyGames(){
        return 'my games - repo'
    }
    async getTopUsers(){
        return 'top users - repo'
    }
}