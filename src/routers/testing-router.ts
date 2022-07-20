import {Request, Response, Router} from "express";
import {db} from "../repository/db";

export const testingRouter = Router({})

testingRouter.delete('/all-data',
    async (req: Request, res: Response) => {
        const result = await db.dropDatabase()
        if (result) return res.sendStatus(204)
        return res.sendStatus(400)
    }
)