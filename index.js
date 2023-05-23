//create an Express application
const express = require("express")
const express_server = express()

//dotenv module to help load environment variables from .env file
const dotenv = require("dotenv")
dotenv.config()

//middleware bodyParser to help process data sent in an HTTP request body 
//separate middlewares are created for parsing json objects, encoded url and text
//extended:true allow objects other than strings to be encoded into the URL-encoded format
const bodyParser = require("body-parser")
const jsonParser = bodyParser.json({extended: true})
const textParser = bodyParser.text({extended: true})
const urlencodedParser = bodyParser.urlencoded({extended: true})

express_server.use(jsonParser);
express_server.use(textParser);
express_server.use(urlencodedParser);

// start the server and specify the port number
//port 3000 will be used unless configured differently
const port = process.env.SERVERPORT || 3000

//export user query functions here
const users = require('./handlers/user')

//route handlers
express_server.get('/user', users.viewUser)
express_server.post('/user', users.addUser)
express_server.put('/user', users.updateUserFull)
express_server.delete('/user', users.deleteUser)
express_server.post('/user/login', users.loginUser)
express_server.post('/user/logout', users.logoffUser)


//server now listens for active connections from the specified port
express_server.listen(port, () => {
  console.log(`Connection established from port ${port}.`)
})

