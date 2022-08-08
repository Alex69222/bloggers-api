import {Request, Response} from "express";
import {db} from "../repository/db";
import {injectable} from "inversify";

@injectable()
export class TestingController {
    async dropDB(req: Request, res: Response) {
        const result = await db.dropDatabase()
        if (result) return res.sendStatus(204)
        return res.sendStatus(400)
    }
}