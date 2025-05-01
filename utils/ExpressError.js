//This is to give which error was thrown 

class ExpressError extends Error{
    constructor(status, message){
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = ExpressError