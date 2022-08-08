import {Router} from "express";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {uniqueLoginValidation} from "../middlewares/users/unique-login-validation";
import {emailValidationMiddleware} from "../middlewares/users/email-validation-middleware";
import {requestFrequencyMiddleware} from "../middlewares/users/request-frequency-middleware";
import {loginFrequencyMiddleware} from "../middlewares/users/login-frequency-middleware";
import {uniqueEmailValidation} from "../middlewares/users/unique-email-validation";
import {confirmationCodeMiddleware} from "../middlewares/users/confirmation-code-middleware";
import {emailIsConfirmedMiddleware} from "../middlewares/users/email-is-confirmed-middleware";
import {refreshTokenMiddleware} from "../middlewares/users/refresh-token-middleware";
import {revokeRefreshTokenMiddleware} from "../middlewares/users/revoke-refresh-token-middleware";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {container} from "../composition-root";
import {AuthController} from "../controllers/auth-controller";

const authController = container.resolve(AuthController)
export const authRouter = Router({})

authRouter.post('/login',
    loginFrequencyMiddleware,
    requestFrequencyMiddleware,
    authController.login.bind(authController)
)
authRouter.post('/registration',
    requestFrequencyMiddleware,
    uniqueLoginValidation,
    uniqueEmailValidation,
    userLoginValidationMiddleware,
    userPasswordValidationMiddleware,
    emailValidationMiddleware,
    validationResultMiddleware,
    authController.register.bind(authController)
)
authRouter.post('/registration-confirmation',
    requestFrequencyMiddleware,
    confirmationCodeMiddleware,
    validationResultMiddleware,
    authController.confirmRegistration.bind(authController))
authRouter.post('/registration-email-resending',
    requestFrequencyMiddleware,
    emailValidationMiddleware,
    emailIsConfirmedMiddleware,
    validationResultMiddleware,
    authController.resendRegistrationEmail.bind(authController)
)
authRouter.post('/refresh-token',
    refreshTokenMiddleware,
    authController.refreshToken.bind(authController)
)
authRouter.post('/logout',
    revokeRefreshTokenMiddleware
)
authRouter.get('/me',
    authMiddleware,
    authController.me.bind(authController)
)