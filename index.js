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
const votes = require('./handlers/vote')
const disputes = require('./handlers/disputes')
const applications = require('./handlers/expertapplication')
const notifications = require('./handlers/notifications')

//route handlers (users)
express_server.get('/user', users.viewOwnUser)
express_server.get('/user/:userid', users.viewAnyUserbyID)
express_server.get('/usernames', users.viewAllUsernames)
express_server.post('/user', users.addUser)
express_server.post('/user/login', users.loginUser)
express_server.post('/user/logout', users.logoffUser)
express_server.put('/user/username', users.updateUsername)
express_server.put('/user/email', users.updateUserEmail)
express_server.put('/user/password', users.updateUserPassword)
express_server.put('/user/profilepic', users.updateUserPic)
express_server.put('/user/level', users.updateUserLevel)
express_server.put('/user/post', users.updateUserPost)
express_server.put('/user/species', users.updateUserSpecies)
express_server.delete('/user', users.deleteUser)

//route handlers (posts)
express_server.get('/posts', posts.viewAllPosts)
express_server.get('/posts/verified', posts.viewAllVerifiedPosts)
express_server.get('/posts/unverified', posts.viewAllUnverifiedPosts)
express_server.get('/posts/user', posts.viewUserPosts)
express_server.get('/post/:postid', posts.viewPost)
express_server.get('/postid/:title', posts.viewPostIdByTitle)
express_server.post('/post', posts.addPost)
express_server.put('/post/:postid/title', posts.updatePostTitle)
express_server.put('/post/:postid/description', posts.updatePostDescription)
express_server.put('/post/:postid/sightinglocation', posts.updatePostSightingLocation)
express_server.put('/post/:postid/class', posts.updatePostClass)
express_server.put('/post/:postid/order', posts.updatePostOrder)
express_server.put('/post/:postid/family', posts.updatePostFamily)
express_server.put('/post/:postid/genus', posts.updatePostGenus)
express_server.put('/post/:postid/species', posts.updatePostSpecies)
express_server.put('/post/:postid/verify', posts.verifyPost)
express_server.put('/post/:postid/flag', posts.flagPost)
express_server.put('/post/:postid/unflag', posts.unFlagPost)
express_server.delete('/post/:postid', posts.deletePost)

//route handlers (comments)
express_server.get('/comments/user', comments.viewUserComments)
express_server.get('/comments/:postid', comments.viewPostComments)
express_server.get('/comment/:commentid', comments.viewComment)
express_server.post('/comment', comments.addComment)
express_server.post('/comment/idsuggestion', comments.addIdSuggestion)
express_server.put('/comment/:commentid/idsuggestion/accept', comments.acceptIdSuggestion)
express_server.put('/comment/:commentid/idsuggestion/reject', comments.rejectIdSuggestion)
express_server.put('/comment/:commentid', comments.updateComment)
express_server.put('/comment/:commentid/:authorid/upvote', comments.upVoteComment)
express_server.put('/comment/:commentid/:authorid/unupvote', comments.unUpVoteComment)
express_server.put('/comment/:commentid/:authorid/downvote', comments.downVoteComment)
express_server.put('/comment/:commentid/:authorid/undownvote', comments.unDownVoteComment)
express_server.delete('/comment/:commentid', comments.deleteComment)

//route handlers (disputes)
express_server.get('/:commentid/disputes', disputes.viewCommentDisputes)
express_server.post('/disputes', disputes.addDispute)
express_server.put('/disputes/:disputeid', disputes.updateDispute)
express_server.delete('/:commentid/disputes/:disputeid', disputes.deleteDispute)
express_server.put('/:commentid/disputes/:disputeid/approve', disputes.approveDispute)

//route handlers (votes)
express_server.get('/upvotes/:commentid/:authorid', votes.checkUpvoteExists)
express_server.get('/downvotes/:commentid/:authorid', votes.checkDownvoteExists)

//route handlers (expert applications)
express_server.get('/expertapplications', applications.viewAllExpertApplications)
express_server.get('/:authorid/expertapplications', applications.viewOwnExpertApplications)
express_server.post('/expertapplications', applications.addExpertApplication)
express_server.put('/:authorid/expertapplications/:applicationid', applications.approveExpertApplication)
express_server.put('/expertapplications/:applicationid', applications.rejectExpertApplication)
express_server.delete('/expertapplications/:applicationid', applications.deleteExpertApplication)

//route handlers (statistics)
express_server.get('/statistics/all', statistics.searchAll)
express_server.get('/statistics/speciesName/:species', statistics.searchSpeciesName)
express_server.get('/statistics/species/:species', statistics.searchSpecies)
express_server.get('/statistics/class/:class_', statistics.searchClass)
express_server.get('/statistics/order/:order', statistics.searchOrder)
express_server.get('/statistics/family/:family', statistics.searchFamily)
express_server.get('/statistics/genus/:genus', statistics.searchGenus)
express_server.get('/catalogue/family', statistics.searchFamilyCatalogue)
express_server.get('/catalogue/order', statistics.searchOrderCatalogue)
express_server.get('/catalogue/genus', statistics.searchGenusCatalogue)
express_server.get('/catalogue/class', statistics.searchClassCatalogue)
express_server.get('/statistics/hour/:species', statistics.getSpeciesSightingsByHour)
express_server.get('/statistics/week/:species', statistics.getSpeciesCountWeek)
express_server.get('/statistics/month/:species', statistics.getSpeciesCountMonth)

//route handlers (notifications)
express_server.get('/notifications', notifications.viewAllNotifications)
express_server.get('/notifications/unviewed', notifications.countAllUnviewedNotifications)
express_server.post('/notifications', notifications.createCommentNotification)
express_server.put('/notifications/:notificationid', notifications.openNotification)

//server now listens for active connections from the specified port
express_server.listen(port, () => {
  console.log(`Connection established from port ${port}.`)
})

