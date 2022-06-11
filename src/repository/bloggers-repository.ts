const bloggers = [
    {
        id: 0,
        name: 'SW blogger',
        youtubeUrl: 'https://youtube.com/SWblogger'
    }, {
        id: 1,
        name: 'LoR blogger',
        youtubeUrl: 'https://youtube.com/LoRblogger'
    }, {
        id: 2,
        name: 'HP blogger',
        youtubeUrl: 'https://youtube.com/HPblogger'
    }, {
        id: 3,
        name: 'Marvel blogger',
        youtubeUrl: 'https://youtube.com/Marvelblogger'
    },
]
export const findBlogger = (id: number) =>{
    return bloggers.find(b => b.id === id)
}

export const bloggersRepository = {

    getBloggers(id?: number) {
        if (id) {
            const blogger = findBlogger(id)
            return blogger
        } else {
            return bloggers
        }
    },
    createBlogger(name: string, youtubeUrl: string) {
        const newBlogger = {
            id: (+new Date()),
            name,
            youtubeUrl
        }
        bloggers.push(newBlogger)
        return newBlogger
    },
    updateBlogger(id:number, name: string, youtubeUrl: string){
        const blogger = findBlogger(id)
        if (blogger){
            blogger.name = name
            blogger.youtubeUrl = youtubeUrl
            return true
        }else{
            return false
        }
    },
    deleteBlogger(id: number){
        const bloggerIndex = bloggers.findIndex(b => b.id === id)
        if(bloggerIndex !== -1){
            bloggers.splice(bloggerIndex, 1)
            return true
        }else{
            return false
        }
    }
}