import {MongoClient} from "mongodb";
import {settngs} from "../settings";


export const client = new MongoClient(settngs.MONGO_URI)
const db = client.db('bloggers-posts')

export const bloggersCollection = db.collection('bloggers')
export const postsCollection = db.collection('posts')

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
