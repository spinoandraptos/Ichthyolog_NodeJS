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

module.exports = {
    viewCommentUpvotes
}