import {Router} from "express";
import {nameValidationMiddleware} from "../middlewares/bloggers/name-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {youtubeUrlValidationMiddleware} from "../middlewares/bloggers/youtube-url-validation-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {container} from "../composition-root";
import {BloggersController} from "../controllers/bloggers-controller";
import {checkUserMiddleware} from "../middlewares/users/check-user-middleware";

const bloggersController = container.resolve(BloggersController)
export const bloggersRouter = Router({})
bloggersRouter.get('/', bloggersController.getBloggers.bind(bloggersController))
bloggersRouter.get('/:id', bloggersController.getBloggerById.bind(bloggersController))
bloggersRouter.get('/:id/posts',checkUserMiddleware, bloggersController.getBloggersPosts.bind(bloggersController))
bloggersRouter.post('/:id/posts',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    validationResultMiddleware,
    bloggersController.createPostForBlogger.bind(bloggersController)
)
bloggersRouter.post('/',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    bloggersController.createBlogger.bind(bloggersController))
bloggersRouter.put('/:id',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    bloggersController.updateBlogger.bind(bloggersController)
)
bloggersRouter.delete('/:id',
    adminAuthorizationMiddleware,
    bloggersController.deleteBlogger.bind(bloggersController)
)