const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewCommentDisputes = async (request, response) => {
    const commentid = request.params.commentid
    try {
      db.clientPool.query('SELECT * FROM disputes WHERE commentid = $1', [commentid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if (result.rowCount != 0) {
          response.status(200).json(result.rows)
        }
        else {
          response.status(404).send('Disputes not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const addDispute= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { commentid, content } = request.body
  
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
            db.clientPool.query('INSERT INTO disputes (commentid, authorid, authorname, authorpicurl, content, postedtime) VALUES ($1, $2, $3, $4, $5, now())', 
            [commentid, userid, authorname, picture, content], 
            (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else {
              db.clientPool.query(
                'UPDATE comments SET disputed = TRUE WHERE commentid = $1',
                [commentid],
                (error, result) => {
                  if (error) {
                    response.send(error.message)
                  }
                  else if(result.rowCount == 1){
                    response.status(201).send(`Dispute by ${authorname} added`)
                  }
                  else {
                    response.status(404).send('Comment not found')
                  }
                }
              )
            }
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

const updateDispute = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const disputeid = request.params.disputeid
    const { content } = request.body
  
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'}) 
      db.clientPool.query(
        'UPDATE disputes SET content = $1, edited = TRUE, editedtime = now() WHERE disputeid = $2',
        [content, disputeid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if(result.rowCount == 1){
            response.status(200).send(`Dispute with disputeid: ${disputeid} modified`)
          }
          else {
            response.status(404).send('Dispute not found')
          }
        }
      )
    } catch(error) {
      response.send(error.message)
    }
  }
  
  const deleteDispute = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const commentid = request.params.commentid
    const disputeid = request.params.disputeid
    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('DELETE FROM disputes WHERE disputeid = $1', [disputeid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          db.clientPool.query('SELECT * FROM disputes WHERE commentid = $1', [commentid], (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else if (result.rowCount == 0) {
              db.clientPool.query(
                'UPDATE comments SET disputed = FALSE WHERE commentid = $1',
                [commentid],
                (error, result) => {
                  if (error) {
                    response.send(error.message)
                  }
                  else if(result.rowCount == 1){
                    response.status(200).send(`Dispute with disputeid: ${disputeid} modified and status changed`)
                  }
                  else {
                    response.status(404).send('Comment not found')
                  }
                })             
            }
            else if (result.rowCount > 0) {
              response.status(200).send(`Dispute with disputeid: ${disputeid} modified`)
            }
            else {
              response.status(404).send('Disputes not found')
            }
         })
        }
        else {
            response.status(404).send('Dispute not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const approveDispute = async (request, response) => {
    const jwt_auth = request.get('Authorisation')
    const disputeid = request.params.disputeid
    const commentid = request.params.commentid
    const postid = request.body.postid

    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
      db.clientPool.query('UPDATE disputes SET disputeapproved = TRUE WHERE disputeid = $1', [disputeid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          db.clientPool.query('UPDATE comments SET idreplaced = TRUE, disputed = FALSE WHERE commentid = $1', [commentid], (error, result) => {
            if (error) {
              response.send(error.message)
            }
            else if(result.rowCount == 1) {
              db.clientPool.query('UPDATE posts SET verified = FALSE WHERE postid = $1', [postid], (error, result) => {
                if (error) {
                  response.send(error.message)
                }
                else if(result.rowCount == 1) {
                  response.status(200).send(`Dispute with disputeid ${disputeid} approved`)
                }
                else {
                  response.status(404).send('Post not found')
                }
              })
            }
            else {
              response.status(404).send('ID suggestion not found')
            }
         })
        }
        else {
            response.status(404).send('Dispute not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }


module.exports = {
    viewCommentDisputes,
    addDispute,
    updateDispute,
    deleteDispute,
    approveDispute
}