const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllExpertApplications = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('SELECT * FROM expertapplicationrequests ORDER BY approved desc, postedtime desc', (error, result) => {
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
      db.clientPool.query('SELECT * FROM expertapplicationrequests WHERE authorid = $1 ORDER BY approved desc, postedtime desc',[authorid], (error, result) => {
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
    const { name, age, gender, occupation, email, contact, credentials } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
        const userid = result.userid  
        db.clientPool.query('SELECT * FROM expertapplicationrequests WHERE authorid = $1 AND approved IS NOT FALSE ',[userid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount == 0) {
            db.clientPool.query('INSERT INTO expertapplicationrequests (authorid, authorname, email, contact, occupation, credentials, gender, age, postedtime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())', 
            [userid, name, email, contact, occupation, credentials, gender, age], 
            (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else {response.status(201).send(`Application by ${name} added`)}
          })
          }
          else if (result.rowCount != 0) {
            response.send(`Existing requests need to be processed`)
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

const deleteExpertApplication = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const applicationid = request.params.applicationid
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('DELETE FROM expertapplicationrequests WHERE applicationid = $1', [applicationid], (error, result) => {
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

  const approveExpertApplication = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const authorid = request.params.authorid
    const applicationid = request.params.applicationid
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('UPDATE expertapplicationrequests SET approved = TRUE WHERE applicationid = $1', [applicationid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount == 1) {
          db.clientPool.query('UPDATE users SET expert = TRUE WHERE userid = $1', [authorid], (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else if (result.rowCount == 1) {
              db.clientPool.query('UPDATE comments SET authorexpert = true WHERE authorid = $1', [authorid], (error, result) => {
                if (error) {
                  response.send(error.message)
                }
                else {
                  response.status(200).send(`User with id: ${authorid} promoted`)
                }
              })
            }
            else {
              response.status(404).send('User not found')
            }
          })
        }
        else {
          response.status(404).send('Application not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const rejectExpertApplication = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const applicationid = request.params.applicationid
    const rejectionreason = request.body.rejectionreason
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('UPDATE expertapplicationrequests SET approved = FALSE, rejectionreason = $1 WHERE applicationid = $2', [rejectionreason, applicationid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount == 1) {
          response.status(200).send(`Application with id: ${applicationid} rejected`)
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
    deleteExpertApplication,
    approveExpertApplication,
    rejectExpertApplication
}