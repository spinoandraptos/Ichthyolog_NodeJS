const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewUserComments = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
  
    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      const userid = result.userid
      db.clientPool.query('SELECT * FROM comments WHERE userid = $1', [userid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Comments not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const viewPostComments = async (request, response) => {
    const postid = request.params.postid
  
    try {
      db.clientPool.query('SELECT * FROM comments WHERE postid = $1 ORDER BY upvotes DESC, postedtime DESC', [postid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Comments not found')
        }
      })
    } catch(error) {
      response.send(error)
    }
  }


  const viewComment = async(request, response) => {
    const commentid = request.params.commentid
    try{
    db.clientPool.query('SELECT * FROM comments WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Comment not found')
      }
    })}
    catch(error) {
      response.send(error.message)
    }
  } 

  const addComment= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { postid, content, authorexpert } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
        const userid = result.userid  
        const authorname = result.username
        db.clientPool.query('SELECT profilepic FROM users WHERE userid = $1', [userid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if(result.rowCount == 1){
            const picture = result.rows[0].profilepic
            db.clientPool.query('INSERT INTO comments (authorid, postid, authorname, content, authorpic, postedtime, authorexpert) VALUES ($1, $2, $3, $4, $5, now(), $6)', 
            [userid, postid, authorname, content, picture, authorexpert], 
            (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else {response.status(201).send(`Comment by ${authorname} added`)}
          })
          }
          else {
            response.status(404).send('User not found')
          }
        })
  } catch(error) {
    response.send(error.message)
  }
}

const addIdSuggestion= async(request, response) => {
  const jwt_auth = request.get('Authorisation')
  const { postid, content } = request.body

  try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
      const authorname = result.username
      db.clientPool.query('SELECT profilepic FROM users WHERE userid = $1', [userid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        if(result.rowCount == 1){
          const picture = result.rows[0].profilepic
          db.clientPool.query('INSERT INTO comments (authorid, postid, authorname, content, authorpic, postedtime, idsuggestion) VALUES ($1, $2, $3, $4, $5, now(), TRUE)', 
          [userid, postid, authorname, content, picture], 
          (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else {response.status(201).send(`Suggestion by ${authorname} added`)}
        })
        }
        else {
          response.status(404).send('User not found')
        }
      })
} catch(error) {
  response.send(error.message)
}
}

const acceptIdSuggestion = async(request, response) => {
  const jwt_auth = request.get('Authorisation')
  const commentid = request.params.commentid
  const { postid, content } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
    db.clientPool.query(
      'SELECT FROM comments WHERE postid = $1 AND suggestionapproved = TRUE AND idreplaced = FALSE AND suggestionrejected = FALSE',
      [postid],
      (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount != 1){
          db.clientPool.query(
            'UPDATE comments SET suggestionapproved = TRUE WHERE commentid = $1',
            [commentid],
            (error, result) => {
              if (error) {
                response.send(error.message)
              }
              else if(result.rowCount == 1){
                db.clientPool.query(
                  'UPDATE posts SET title = $1, verified = TRUE, flagged = FALSE WHERE postid = $2',
                  [content, postid],
                  (error, result) => {
                    if (error) {
                      response.send(error.message)
                    }
                    else if(result.rowCount == 1){
                    response.status(200).send(`Post with postid: ${postid} modified`)
                    }
                    else {
                      response.status(404).send('Post not found')
                    }
                  }
                )
              }
              else {
                response.status(404).send('Post not found')
              }
            }
          )
        }
        else {
          response.status(404).send('Approved ID already exists')
        }
      }
    )   
  } catch(error) {
    response.send(error.message)
  }
}

const rejectIdSuggestion = async(request, response) => {
  const jwt_auth = request.get('Authorisation')
  const commentid = request.params.commentid
  const rejectionreason = request.body.rejectionreason

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
    db.clientPool.query(
      'UPDATE comments SET suggestionrejected = TRUE, idrejectionreason = $1 WHERE commentid = $2',
      [rejectionreason, commentid],
      (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          response.status(200).send(`Suggestion with id ${commentid} rejected`)
        }
        else {
          response.status(404).send('Suggestion not found')
        }
      }
    )   
  } catch(error) {
    response.send(error.message)
  }
}

const updateComment = async(request, response) => {
  const jwt_auth = request.get('Authorisation')
  const commentid = request.params.commentid
  const { content } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'}) 
    db.clientPool.query(
      'UPDATE comments SET content = $1, edited = TRUE, editedtime = now() WHERE commentid = $2',
      [content, commentid],
      (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
        response.status(200).send(`Comment with commentid: ${commentid} modified`)
        }
        else {
          response.status(404).send('Comment not found')
        }
      }
    )
  } catch(error) {
    response.send(error.message)
  }
}

const deleteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const commentid = request.params.commentid
  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    db.clientPool.query('DELETE FROM comments WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount == 1) {
        response.status(200).send(`Comment with id: ${commentid} deleted`)
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const upVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid
  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    db.clientPool.query('UPDATE comments SET upvotes = upvotes + 1 WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount == 1) {
        db.clientPool.query('INSERT INTO upvotes (commentid, upvoterid) VALUES ($1, $2)', [commentid, authorid], (error, result) => {
          if (error) {
            response.send(error.message)
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
    response.send(error.message)
  }
}

const unUpVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    db.clientPool.query('UPDATE comments SET upvotes = upvotes - 1 WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount == 1) {
        db.clientPool.query('DELETE FROM upvotes WHERE commentid = $1 AND upvoterid = $2', [commentid, authorid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          response.status(200).send(`Comment with id: ${commentid} un-upvoted`)
        })
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const downVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    db.clientPool.query('UPDATE comments SET upvotes = upvotes - 1 WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount == 1) {
        db.clientPool.query('INSERT INTO downvotes (commentid, downvoterid) VALUES ($1, $2)', [commentid, authorid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          response.status(200).send(`Comment with id: ${commentid} downvoted`)
        })
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const unDownVoteComment = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const authorid = request.params.authorid
  const commentid = request.params.commentid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    db.clientPool.query('UPDATE comments SET upvotes = upvotes + 1 WHERE commentid = $1', [commentid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount == 1) {
        db.clientPool.query('DELETE FROM downvotes WHERE commentid = $1 AND downvoterid = $2', [commentid, authorid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          response.status(200).send(`Comment with id: ${commentid} un-downvoted`)
        })
      }
      else {
        response.status(404).send('Comment not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

module.exports = {
  viewComment,
  viewPostComments,
  viewUserComments,
  addComment,
  addIdSuggestion,
  acceptIdSuggestion,
  rejectIdSuggestion,
  updateComment,
  deleteComment,
  upVoteComment,
  unUpVoteComment,
  downVoteComment,
  unDownVoteComment
}