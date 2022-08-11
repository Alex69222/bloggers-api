import {CommentsService, CommentType} from "../domain/comments-service";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";
@injectable()
export class CommentsController {
    constructor(
        @inject(CommentsService) protected commentsService: CommentsService
    ) {
    }

    async getCommentById(req: Request<{ commentId: string }, Omit<CommentType, '_id' | 'postId'> & { id: string } | null, {}, {}>, res: Response<Omit<CommentType, '_id' | 'postId'> & { id: string } | null>) {
        const userId = req.user?.id
        const comment = await this.commentsService.findCommentById(req.params.commentId, userId)
        if (comment) {
            res.status(200).send(comment)
        } else {
            res.sendStatus(404)
        }
    }

    async updateCommentById(req: Request<{ commentId: string }, null, { content: string }, {}>, res: Response<null>) {
        const comment = await this.commentsService.findCommentById(req.params.commentId)
        if (!comment) return res.sendStatus(404)
        if (comment.userId !== req.user!.id) return res.sendStatus(403)

        const result = await this.commentsService.updateComment(req.params.commentId, req.body.content)
        if (result) {
            return res.sendStatus(204)
        } else {
            return res.sendStatus(404)
        }
    }

    async deleteComment(req: Request<{ commentId: string }, null, {}, {}>, res: Response<null>) {
        const comment = await this.commentsService.findCommentById(req.params.commentId)
        if (!comment) return res.sendStatus(404)
        if (comment.userId !== req.user!.id) return res.sendStatus(403)

        const result = await this.commentsService.deleteComment(req.params.commentId)
        if (result) {
            return res.sendStatus(204)
        } else {
            return res.sendStatus(404)
        }
    }
    async setCommentLikeStatus(req: Request<{commentId: string},null,{likeStatus: string},{}>, res: Response<null>){
        // console.log(req.params.commentId)
        const comment = await this.commentsService.findCommentById(req.params.commentId)
        if(!comment) return res.sendStatus(404)
        await this.commentsService.setCommentLikeStatus(req.params.commentId, req.user!.id, req.user!.accountData.userName, req.body.likeStatus)
        res.sendStatus(204)
    }
}