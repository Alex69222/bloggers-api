import {Router} from "express";
import {commentContentValidationMiddleware} from "../middlewares/comments/comment-content-validation-middleware";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {container} from "../composition-root";
import {CommentsController} from "../controllers/comments-controller";
import {checkUserMiddleware} from "../middlewares/users/check-user-middleware";

const commentsController = container.resolve(CommentsController)
export const commentsRouter = Router({})

commentsRouter.get('/:commentId',checkUserMiddleware, commentsController.getCommentById.bind(commentsController))
commentsRouter.put('/:commentId',
    authMiddleware,
    commentContentValidationMiddleware,
    validationResultMiddleware,
    commentsController.updateCommentById.bind(commentsController)
)

commentsRouter.delete('/:commentId',
    authMiddleware,
    commentsController.deleteComment.bind(commentsController)
)

commentsRouter.put('/:commentId/like-status',
    authMiddleware,
    commentsController.setCommentLikeStatus.bind(commentsController)
)