import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";



export const   validObjectIdMiddleware =  async (req: Request<{commentId: string}>, res: Response, next: NextFunction) => {
    if (req.params.commentId && !ObjectId.isValid(req.params.commentId) ){
        return res.sendStatus(404)
    }else{
        next()
    }
}