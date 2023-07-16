const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllExpertApplications = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.dbConnect().query('SELECT * FROM expertapplicationrequests ORDER BY approved desc, postedtime desc', (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Applications not found')
        }
      })
    }
    catch(error) {
        response.send(error.message)
      }
}   

const viewOwnExpertApplications = async (request, response) => {
    const authorid = request.params.authorid
    const jwt_auth = request.get('Authorisation')
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.dbConnect().query('SELECT * FROM expertapplicationrequests ORDER BY approved desc, postedtime desc WHERE authorid = $1',[authorid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Applications not found')
        }
      })
    }
    catch(error) {
        response.send(error.message)
      }
}   

const addExpertApplication= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { age, gender, occupation, email, contact, title, credentials } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
        const userid = result.userid  
        const authorname = result.username
            db.dbConnect().query('INSERT INTO expertapplicationrequests (authorid, authorname, email, contact, occupation, credentials, gender, age, title, postedtime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())', 
            [userid, authorname, email, contact, occupation, credentials, gender, age, title], 
            (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else {response.status(201).send(`Application by ${authorname} added`)}
          })
    }
   catch(error) {
    response.send(error.message)
  }
}

const deleteExpertApplication = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const applicationid = request.params.applicationid
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.dbConnect().query('DELETE FROM expertapplicationrequests WHERE applicationid = $1', [applicationid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount == 1) {
          response.status(200).send(`Application with id: ${applicationid} deleted`)
        }
        else {
          response.status(404).send('Application not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  module.exports = {
    viewAllExpertApplications,
    viewOwnExpertApplications,
    addExpertApplication,
    deleteExpertApplication
}