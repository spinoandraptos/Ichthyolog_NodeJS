const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllNotifications = async (request, response) => {
    const jwt_auth = request.get('Authorisation')

    try{
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
        const userid = result.userid
        db.dbConnect().query('SELECT * FROM notifications ORDER BY time desc WHERE receiverid = $1', [userid], (error, result) => {
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

const openNotification = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const notificationid = request.params.notificationid
    try{
        jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
        db.dbConnect().query('UPDATE notifications SET viewed = TRUE WHERE notificationid = $1', [notificationid], (error, result) => {
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
    const { receiverusername, notificationcontent, senderprofilepic, postid } = request.body
  
    try{
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
        const userid = result.userid  
        const authorname = result.username
        db.dbConnect().query('INSERT INTO notifications (receiverusername, notificationcontent,  senderprofilepic, time, senderusername, senderid, postid ) VALUES ($1, $2, $3, now(), $4, $5, $6)', 
        [receiverusername, notificationcontent, senderprofilepic, authorname, userid, postid], (error, result) => {
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
    createCommentNotification
}