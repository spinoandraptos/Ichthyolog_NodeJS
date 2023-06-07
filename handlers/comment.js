const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewUserComments = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
  
    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
      const userid = result.userid
      db.dbConnect().query('SELECT * FROM comments WHERE userid = $1', [userid], (error, result) => {
        if (error) {
          throw error
        }
        if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('comments not found')
        }
      })
    } catch {
      response.status(401).send("Bad Token")
    }
  }

  const viewPostComments = async (request, response) => {
    const postid = request.params.postid
  
    try {
      db.dbConnect().query('SELECT * FROM comments WHERE postid = $1', [postid], (error, result) => {
        if (error) {
          throw error
        }
        if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('comments not found')
        }
      })
    } catch {
      response.status(401).send("Bad Token")
    }
  }


  const viewComment = async(request, response) => {
    const commentid = request.params.commentid
    db.dbConnect().query('SELECT * FROM comments WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('comment not found')
      }
    })
  } 

  const addComment= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { title, description, sightingLocation, sightingTime, imageURL } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
        const userid = result.userid  
        const authorname = result.username
        db.dbConnect().query('SELECT profilepic FROM users WHERE userid = $1', [userid], (error, result) => {
          if (error) {
            throw error
          }
          if(result.rowCount == 1){
            const picture = result.rows[0].profilepic
            db.dbConnect().query('INSERT INTO comments (userid, authorname, title, description, time, sightinglocation, sightingtime, imageurl, authorpicurl) VALUES ($1, $2, $3, $4, now(), $5, $6, $7, $8)', 
            [userid, authorname, title, description, sightingLocation, sightingTime, imageURL, picture], 
            (error, results) => {
            if (error) {
              throw error
            }
            response.status(201).send(`comment with title: ${title} added`)
          })
          }
          else {
            response.status(404).send('User not found')
          }
        })
  } catch(error) {
    console.log(error)
    response.status(401).send("Failed to add comment")
  }
}

module.exports = {
  viewComment,
  viewPostComments,
  viewUserComments,
  addComment
}