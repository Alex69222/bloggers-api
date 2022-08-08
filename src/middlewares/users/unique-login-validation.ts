import {body} from "express-validator";
import {UsersService} from "../../domain/users-service";
import {usersService} from "../../composition-root";
export const uniqueLoginValidation = body('login')
    .custom(async value => {
        const loginAlreadyExists = await usersService.findByLogin(value)
        if (loginAlreadyExists) {
            return Promise.reject('This login is already taken')
        } else {
            return true
        }
    })