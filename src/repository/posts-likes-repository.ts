import {injectable} from "inversify";
import {ObjectId} from "mongodb";
import {postsLikesCollection} from "./db";

@injectable()
export class PostsLikesRepository{
 async findPostsLikes(id: string){
     if(!ObjectId.isValid(id)) return false
     const result = await postsLikesCollection.findOne({_id: new ObjectId(id)})
     return result || false
 }
}