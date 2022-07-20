export const searchTermHandler = (term: any) =>{
    if (typeof term === 'string'){
        return term
    }else{
        return ''
    }
}