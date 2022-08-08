export const idMapper = (el: any) =>{
    if(Array.isArray(el)){
      return   el.map(e =>{
            if (e?._id){
                const {_id, ...rest} = e
                return{
                    ...rest,
                    id: e._id.toString()
                }
            }else {
                return e
            }
        })
    }else if(typeof  el === 'object'){
        if(el?._id){
            const {_id, ...rest} = el
            return {
                ...rest,
                id: el._id.toString()
            }
        }else {
            return el
        }
    }else {
        return el
    }
}