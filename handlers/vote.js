const db = require('../database')
const dotenv = require('dotenv')

dotenv.config()

  const checkUpvoteExists = async (request, response) => {
    const commentid = request.params.commentid
    const authorid = request.params.authorid
      try {
      db.clientPool.query('SELECT * FROM upvotes WHERE commentid = $1 AND upvoterid = $2', [commentid, authorid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          response.status(200).json(result.rows)
        } 
        else {
          response.status(200).send('Invalid search')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const checkDownvoteExists = async (request, response) => {
    const commentid = request.params.commentid
    const authorid = request.params.authorid
      try {
      db.clientPool.query('SELECT * FROM downvotes WHERE commentid = $1 AND downvoterid = $2', [commentid, authorid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          response.status(200).json(result.rows)
        } else {
          response.status(200).send('Invalid search')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

module.exports = {
    checkUpvoteExists,
    checkDownvoteExists
}