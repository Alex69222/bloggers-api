import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";



export const   validObjectIdMiddleware =  async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    if (req.params.id && !ObjectId.isValid(req.params.id) ){
        return res.sendStatus(404)
    }else{
        next()
    }
}