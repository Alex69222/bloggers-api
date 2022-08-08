import {body} from "express-validator";
import {UsersService} from "../../domain/users-service";
import {usersService} from "../../composition-root";
export const uniqueEmailValidation = body('email')
    .custom(async value => {
        const emailAlreadyExists = await usersService.findUserByEmail(value)
        if (emailAlreadyExists) {
            return Promise.reject('This email is already taken')
        } else {
            return true
        }
    })