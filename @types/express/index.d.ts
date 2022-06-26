import {UserType} from "../../src/domain/users-service";

declare  global {
    namespace  Express{
        interface Request{
            user: UserType | null
        }
    }
}