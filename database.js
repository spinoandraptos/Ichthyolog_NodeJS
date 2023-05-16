//dotenv module to help load environment variables from .env file
const dotenv = require("dotenv")
dotenv.config()

//create a pool of clients 
const { Pool } = require("pg");
 
//connection function will be exported for use by handlers
module.exports = {
    dbConnect: function () {
    const clientPool = new Pool({ 
        connectionString:process.env.conectionString 
    });
    return clientPool;
    }
}
