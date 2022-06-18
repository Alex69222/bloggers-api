import express, {Request, Response} from 'express'
import {bloggersRouter} from "./routers/bloggers-router";
import {postsRouter} from "./routers/posts-router";
import {runDb} from "./repository/db";

const app = express();
app.use(express.json())
const port = process.env.PORT || 3003

app.get('/', (req: Request, res: Response) =>{
    res.send('Bloggers Tube')
})

app.use('/api/bloggers', bloggersRouter)
app.use('/api/posts', postsRouter)

const startApp = async () =>{
    await runDb()
    app.listen(port, () =>{
        console.log(`Server started at port:  ${port}`)
    })
}

startApp()