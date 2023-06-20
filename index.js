//create an Express application
const express = require("express")
const cors = require('cors')
const express_server = express()

//dotenv module to help load environment variables from .env file
const dotenv = require("dotenv")
dotenv.config()

//CORS configuration
var corsOptions = {
  origin: 'https://ichthyolog-nodejs.onrender.com',
}

//middleware bodyParser to help process data sent in an HTTP request body 
//separate middlewares are created for parsing json objects, encoded url and text
//extended:true allow objects other than strings to be encoded into the URL-encoded format
const bodyParser = require("body-parser")
const jsonParser = bodyParser.json({extended: true})
const textParser = bodyParser.text({extended: true})
const urlencodedParser = bodyParser.urlencoded({extended: true})

express_server.use(jsonParser)
express_server.use(textParser)
express_server.use(urlencodedParser)
express_server.use(cors())

// start the server and specify the port number
//port 3000 will be used unless configured differently
const port = process.env.PORT || 3000

//export query functions here
const users = require('./handlers/user')
const posts = require('./handlers/post')
const comments = require('./handlers/comment')
const statistics = require('./handlers/statistics')
const upvotes = require("./handlers/upvote")

//route handlers (users)
express_server.get('/user', users.viewUser)
express_server.get('/user/:userid', users.viewUserbyID)
express_server.post('/user', users.addUser)
express_server.post('/user/login', users.loginUser)
express_server.post('/user/logout', users.logoffUser)
express_server.put('/user', users.updateUserProfile)
express_server.put('/user/username', users.updateUserUsername)
express_server.put('/user/email', users.updateUserEmail)
express_server.put('/user/password', users.updateUserPassword)
express_server.put('/user/pic', users.updateUserPic)
express_server.put('/user/usernamepassword', users.updateUserUsernamePassword)
express_server.put('/user/emailusername', users.updateUserUsernameEmail)
express_server.put('/user/emailpassword', users.updateUserEmailPassword)
express_server.put('/user/level', users.updateUserLevel)
express_server.put('/user/post', users.updateUserPost)
express_server.put('/user/species', users.updateUserSpecies)
express_server.delete('/user', users.deleteUser)

//route handlers (posts)
express_server.get('/posts', posts.viewAllPosts)
express_server.get('/posts/verified', posts.viewAllVerifiedPosts)
express_server.get('/posts/unverified', posts.viewAllUnverifiedPosts)
express_server.get('/post/user', posts.viewUserPosts)
express_server.get('/post/:postid', posts.viewPost)
express_server.post('/post', posts.addPost)
express_server.put('/post/:postid', posts.updatePost)
express_server.put('/post/:postid/verify', posts.verifyPost)
express_server.put('/post/:postid/flag', posts.flagPost)
express_server.put('/post/:postid/unflag', posts.unFlagPost)
express_server.delete('/post/:postid', posts.deletePost)

//route handlers (comments)
express_server.get('/comments/user', comments.viewUserComments)
express_server.get('/comment/:postid', comments.viewLatestPostComment)
express_server.get('/comments/:postid', comments.viewPostComments)
express_server.get('/comment/:commentid', comments.viewComment)
express_server.post('/comment', comments.addComment)
express_server.put('/comment/:commentid/:authorid/upvote', comments.upVoteComment)
express_server.put('/comment/:commentid/:authorid/downvote', comments.downVoteComment)
express_server.delete('/comment/:commentid', comments.deleteComment)

//route handlers (upvotes)
express_server.get('/upvotes/:commentid', upvotes.viewCommentUpvotes)
express_server.get('/upvotes/:commentid/:authorid', upvotes.checkUpvoteExists)

//route handlers (statistics)
express_server.get('/statistics/species/:species', statistics.searchSpecies)
express_server.get('/statistics/class/:class_', statistics.searchClass)
express_server.get('/statistics/order/:order', statistics.searchOrder)
express_server.get('/statistics/family/:family', statistics.searchFamily)
express_server.get('/statistics/genus/:genus', statistics.searchGenus)
express_server.get('/catalogue/family', statistics.searchFamilyCatalogue)
express_server.get('/catalogue/order', statistics.searchOrderCatalogue)
express_server.get('/catalogue/genus', statistics.searchGenusCatalogue)
express_server.get('/catalogue/class', statistics.searchClassCatalogue)




//server now listens for active connections from the specified port
express_server.listen(port, () => {
  console.log(`Connection established from port ${port}.`)
})

