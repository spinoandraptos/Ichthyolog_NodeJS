//dotenv module to help load environment variables from .env file
const dotenv = require("dotenv")
dotenv.config()

//create a pool of clients 
const { Pool } = require("pg")
 
//connection function will be exported for use by handlers
//each time a handler makes a query to the database, a new connection is made using this function

const clientPool = new Pool({ 
    connectionString:process.env.conectionString 
})

module.exports = {
    clientPool
}
