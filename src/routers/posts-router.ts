import {Router} from "express";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {bloggerIdValidationMiddleware} from "../middlewares/bloggers/blogger-id-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {commentContentValidationMiddleware} from "../middlewares/comments/comment-content-validation-middleware";
import {container} from "../composition-root";
import {PostsController} from "../controllers/posts-controller";
import {likeStatusMiddleware} from "../middlewares/like-status-middleware";
import {checkUserMiddleware} from "../middlewares/users/check-user-middleware";


const postsController = container.resolve(PostsController)
export const postsRouter = Router({})

postsRouter.get('/', checkUserMiddleware, postsController.getPosts.bind(postsController))

postsRouter.get('/:id', checkUserMiddleware, postsController.getPostById.bind(postsController))

postsRouter.post('/:id/comments',
    authMiddleware,
    commentContentValidationMiddleware,
    validationResultMiddleware,
    postsController.createCommentToPost.bind(postsController))
postsRouter.get('/:id/comments',checkUserMiddleware, postsController.getPostsComments.bind(postsController))

postsRouter.put('/:id',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    postsController.updatePost.bind(postsController)
)

postsRouter.post('/',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    postsController.createPost.bind(postsController)
)

postsRouter.delete('/:id',
    adminAuthorizationMiddleware,
    postsController.deletePost.bind(postsController))

postsRouter.put('/:id/like-status',
    authMiddleware,
    likeStatusMiddleware,
    validationResultMiddleware,
    postsController.setPostLikeStatus.bind(postsController)
)