import {Router} from "express";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {uniqueLoginValidation} from "../middlewares/users/unique-login-validation";
import {container} from "../composition-root";
import {UsersController} from "../controllers/users-controller";
// import {usersController} from "../composition-root";

export const usersRouter = Router({})
const usersController = container.resolve(UsersController)
usersRouter.get('/', usersController.getUsers.bind(usersController))

usersRouter.post('/',
    adminAuthorizationMiddleware,
    userLoginValidationMiddleware,
    uniqueLoginValidation,
    userPasswordValidationMiddleware,
    validationResultMiddleware,
    usersController.createUser.bind(usersController)
)
usersRouter.delete('/:userId',
    adminAuthorizationMiddleware,
    usersController.deleteUser.bind(usersController)
)
