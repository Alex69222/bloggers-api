import express, {Request, Response} from 'express'
import cookieParser from 'cookie-parser'
import {bloggersRouter} from "./routers/bloggers-router";
import {postsRouter} from "./routers/posts-router";
import {runDb} from "./repository/db";
import {usersRouter} from "./routers/users-router";
import {authRouter} from "./routers/auth-router";
import {commentsRouter} from "./routers/comments-router";
import {emailRouter} from "./routers/email-router";
import {testingRouter} from "./routers/testing-router";
import {quizRouter} from "./routers/quiz-router";

const app = express();
app.set('trust proxy', true)
app.use(express.json())
app.use(cookieParser())
const port = process.env.PORT || 3003

app.get('/', (req: Request, res: Response) => {
    res.send('Bloggers Tube')
})

app.use('/api/bloggers', bloggersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/send', emailRouter)
app.use('/api/pair-game-quiz', quizRouter)
app.use('/api/testing', testingRouter)
const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Server started at port:  ${port}`)
    })
}

startApp()