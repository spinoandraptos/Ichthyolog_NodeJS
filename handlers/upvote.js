const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewCommentUpvotes = async (request, response) => {
    const commentid = request.params.commentid
      try {
      db.dbConnect().query('SELECT upvoterid FROM upvotes WHERE commentid = $1', [commentid], (error, result) => {
        if (error) {
          throw error
        }
        if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Upvotes not found')
        }
      })
    } catch {
      response.status(404).send(error)
    }
  }

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
    } catch {
      response.status(404).send(error)
    }
  }

module.exports = {
    viewCommentUpvotes,
    checkUpvoteExists
}