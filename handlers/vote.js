const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

  const checkUpvoteExists = async (request, response) => {
    const commentid = request.params.commentid
    const authorid = request.params.authorid
      try {
      db.dbConnect().query('SELECT EXISTS (SELECT * FROM upvotes WHERE commentid = $1 AND upvoterid = $2)', [commentid, authorid], (error, result) => {
        if (error) {
          throw error
        }
        if(result.rowCount == 1){
          response.status(200).json(result.rows)
        } else {
          response.status(200).send('Invalid search')
        }
      })
    } catch(error) {
      response.status(404).send(error)
    }
  }

  const checkDownvoteExists = async (request, response) => {
    const commentid = request.params.commentid
    const authorid = request.params.authorid
      try {
      db.dbConnect().query('SELECT EXISTS (SELECT * FROM downvotes WHERE commentid = $1 AND downvoterid = $2)', [commentid, authorid], (error, result) => {
        if (error) {
          throw error
        }
        if(result.rowCount == 1){
          response.status(200).json(result.rows)
        } else {
          response.status(200).send('Invalid search')
        }
      })
    } catch(error) {
      response.status(404).send(error)
    }
  }

module.exports = {
    checkUpvoteExists,
    checkDownvoteExists
}