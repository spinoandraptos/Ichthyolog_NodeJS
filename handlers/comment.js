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
    } catch(error) {
      response.status(404).send(error)
    }
  }
  const viewLatestPostComment = async (request, response) => {
    const postid = request.params.postid
  
    try {
      db.dbConnect().query('SELECT * FROM comments WHERE postid = $1 ORDER BY commentid DESC LIMIT 1 ', [postid], (error, result) => {
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
    } catch(error) {
      response.status(404).send(error)
    }
  }

  const viewPostComments = async (request, response) => {
    const postid = request.params.postid
  
    try {
      db.dbConnect().query('SELECT * FROM comments WHERE postid = $1 ORDER BY upvotes DESC, postedtime DESC', [postid], (error, result) => {
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
    } catch(error) {
      response.status(404).send(error)
    }
  }


  const viewComment = async(request, response) => {
    const commentid = request.params.commentid
    try{
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
    })}
    catch(error) {
      response.status(404).send(error)
    }
  } 

  const addComment= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { postid, content } = request.body
  
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
            db.dbConnect().query('INSERT INTO comments (authorid, postid, authorname, content, authorpic, postedtime) VALUES ($1, $2, $3, $4, $5, now())', 
            [userid, postid, authorname, content, picture], 
            (error, result) => {
            if (error) {
              throw error
            }
            response.status(201).send(`Comment by ${authorname} added`)
          })
          }
          else {
            response.status(404).send('User not found')
          }
        })
  } catch(error) {
    response.status(404).send(error)
  }
}

const deleteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const commentid = request.params.commentid
  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('DELETE FROM comments WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        throw error
      }
      console.log(result)
      if (result.rowCount == 1) {
        response.status(200).send(`Comment with id: ${commentid} deleted`)
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.status(404).send(error)
  }
}

const upVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid
  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE comments SET upvotes = upvotes + 1 WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        db.dbConnect().query('INSERT INTO upvotes (commentid, upvoterid) VALUES ($1, $2)', [commentid, authorid], (error, result) => {
          if (error) {
            throw error
          }
          else {
          response.status(200).send(`Comment with id: ${commentid} upvoted`)
          }
        })
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.status(404).send(error)
  }
}

const downVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE comments SET upvotes = upvotes - 1 WHERE commentid = $1'), [commentid], (error, result) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        db.dbConnect().query('DELETE FROM upvotes WHERE commentid = $1 AND upvoterid = $2)', [commentid, authorid], (error, result) => {
          if (error) {
            throw error
          }
          response.status(200).send(`Comment with id: ${commentid} downvoted`)
        })
      }
      else {
        response.status(404).send('Comment not found')
      }
    }
  } catch(error) {
    response.status(404).send(error)
  }
}

module.exports = {
  viewComment,
  viewLatestPostComment,
  viewPostComments,
  viewUserComments,
  addComment,
  deleteComment,
  upVoteComment,
  downVoteComment
}