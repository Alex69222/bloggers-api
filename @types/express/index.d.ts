import {UserType} from "../../src/domain/users-service";

declare  global {
    namespace  Express{
        interface Request{
            user: Omit<UserType, '_id' | 'password'> & {id: string} | null
        }
    }
}