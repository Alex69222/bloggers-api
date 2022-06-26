import {Request, Response, Router} from "express";
import {commentsService} from "../domain/comments-service";
import {commentContentValidationMiddleware} from "../middlewares/comments/comment-content-validation-middleware";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";


export const commentsRouter = Router({})

commentsRouter.get('/:commentId',
    async (req: Request, res: Response) => {
        const comment = await commentsService.findCommentById(+req.params.commentId)
        if(comment){
            res.status(200).send(comment)
        }else{
            res.sendStatus(404)
        }
    }
)
commentsRouter.put('/:commentId',
    authMiddleware,
    commentContentValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const comment = await commentsService.findCommentById(+req.params.commentId)
        if(!comment) return res.sendStatus(404)
        if(comment.userId !== req.user!.id) return res.sendStatus(403)

        const result = await commentsService.updateComment(+req.params.commentId, req.body.content)
        if(result){
            return res.sendStatus(204)
        } else{
            return  res.sendStatus(404)
        }
    }
)

commentsRouter.delete('/:commentId',
    authMiddleware,
    async (req: Request, res: Response) => {
        const comment = await commentsService.findCommentById(+req.params.commentId)
        if(!comment) return res.sendStatus(404)
        if(comment.userId !== req.user!.id) return res.sendStatus(403)

        const result = await commentsService.deleteComment(+req.params.commentId)
        if(result){
            return res.sendStatus(204)
        } else{
            return  res.sendStatus(404)
        }
    }
)