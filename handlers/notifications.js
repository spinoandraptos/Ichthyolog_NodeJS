const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllNotifications = async (request, response) => {
    const jwt_auth = request.get('Authorisation')

    try{
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
        const authorname = result.username
        db.clientPool.query('SELECT * FROM commentnotifications WHERE receiverusername = $1 ORDER BY time desc', [authorname], (error, result) => {
        if (error) {
            response.send(error.message)
        }
        else if (result.rowCount != 0) {
            response.status(200).json(result.rows)
        }
        else {
            response.status(404).send('Notifications not found')
        }
        })
    }
    catch(error) {
        response.send(error.message)
    }
}

const countAllUnviewedNotifications = async (request, response) => {
    const jwt_auth = request.get('Authorisation')

    try{
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
        const authorname = result.username
        db.clientPool.query('SELECT * FROM commentnotifications WHERE receiverusername = $1 AND viewed = FALSE', [authorname], (error, result) => {
        if (error) {
            response.send(error.message)
        }
        else if (result.rowCount != 0) {
            response.status(200).json(result.rowCount)
        }
        else {
            response.status(404).send('Notifications not found')
        }
        })
    }
    catch(error) {
        response.send(error.message)
    }
}

const openNotification = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const notificationid = request.params.notificationid
    try{
        jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
        db.clientPool.query('UPDATE commentnotifications SET viewed = TRUE WHERE notificationid = $1', [notificationid], (error, result) => {
        if (error) {
            response.send(error.message)
        }
        else if (result.rowCount == 1) {
            response.status(200).json(result.rows)
        }
        else {
            response.status(404).send('Notifications not found')
        }
        })
    }
    catch(error) {
        response.send(error.message)
    }
}

const createCommentNotification = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { receiverusername, notificationcontent, senderprofilepic, postid, postpicture } = request.body
  
    try{
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
        const userid = result.userid  
        const authorname = result.username
        db.clientPool.query('INSERT INTO commentnotifications (receiverusername, notificationcontent,  senderprofilepic, time, senderusername, senderid, postid, postpicture ) VALUES ($1, $2, $3, now(), $4, $5, $6, $7)', 
        [receiverusername, notificationcontent, senderprofilepic, authorname, userid, postid, postpicture], (error, result) => {
            if (error) {
                response.send(error.message)
              }
              else {
                response.status(201).send(`Notification for ${receiverusername} added`)
              }
        })
    }
    catch(error) {
        response.send(error.message)
    }
}

module.exports = {
    viewAllNotifications,
    openNotification,
    createCommentNotification,
    countAllUnviewedNotifications
}