import {MongoClient} from "mongodb";
import {settings} from "../settings";
import {UserType} from "../domain/users-service";
import {CommentType} from "../domain/comments-service";


export const client = new MongoClient(settings.MONGO_URI)
const db = client.db('bloggers-posts')

export const bloggersCollection = db.collection('bloggers')
export const postsCollection = db.collection('posts')
export const usersCollection = db.collection<UserType>('users')
export const commentsCollection = db.collection<CommentType>('comments')

export async  function runDb(){
    try{
        await client.connect()
        await client.db('bloggers-posts').command({ping: 1})
        console.log('Successfully connected to mongo atlas')
    }catch (e){
        console.log('Connection to mongo atlas failed')
        await client.close()
    }
}
