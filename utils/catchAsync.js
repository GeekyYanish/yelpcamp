//this function returns the func and runs it again and catches the next error

module.exports = func=>{
    return(req, res, next) =>{
        func(req,res,next).catch(next)
    }
}