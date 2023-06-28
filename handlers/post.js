const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllPosts = async (request, response) => {

  db.dbConnect().query('SELECT * FROM posts ORDER BY flagged desc, time desc ', (error, result) => {
    if (error) {
      response.send(error.message)
    }
    else if (result.rowCount != 0) {
      response.status(200).json(result.rows)
    }
    else {
      response.status(404).send('Posts not found')
    }
  })
}

const viewAllVerifiedPosts = async (request, response) => {

  db.dbConnect().query('SELECT * FROM posts WHERE verified ORDER BY flagged desc, time desc', (error, result) => {
    if (error) {
      response.send(error.message)
    }
    else if (result.rowCount != 0) {
      response.status(200).json(result.rows)
    }
    else {
      response.status(404).send('Posts not found')
    }
  })
}

const viewAllUnverifiedPosts = async (request, response) => {

  db.dbConnect().query('SELECT * FROM posts WHERE NOT verified ORDER BY flagged desc, time desc', (error, result) => {
    if (error) {
      response.send(error.message)
    }
    else if (result.rowCount != 0) {
      response.status(200).json(result.rows)
    }
    else {
      response.status(404).send('Posts not found')
    }
  })
}

const viewUserPosts = async (request, response) => {
  const jwt_auth = request.get('Authorisation')

  try {
    const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    const userid = result.userid
    db.dbConnect().query('SELECT * FROM posts WHERE userid = $1 ORDER BY flagged desc, time desc', [userid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if (result.rowCount != 0) {
        response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Posts not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

  const viewPost = async(request, response) => {
    const postid = request.params.postid
    db.dbConnect().query('SELECT * FROM posts WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } 

  const viewPostIdByTitle = async(request, response) => {
    const title = request.params.title
    db.dbConnect().query('SELECT postid FROM posts WHERE title = $1', [title], (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  }
  
  
  const addPost= async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { title, description, sightingLocation, sightingTime, imageURL, _class, order, family, genus } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
        const userid = result.userid  
        const authorname = result.username
        db.dbConnect().query('SELECT profilepic FROM users WHERE userid = $1', [userid], (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if(result.rowCount == 1){
            var blank = ''
            const picture = result.rows[0].profilepic
            db.dbConnect().query('UPDATE users SET totalposts = totalposts + 1 WHERE userid = $1'), [userid]
            db.dbConnect().query('UPDATE users SET level = level + 1 WHERE userid = $1'), [userid]
            db.dbConnect().query('INSERT INTO posts (userid, authorname, title, description, time, sightinglocation, sightingtime, imageurl, authorpicurl, class, _order, family, genus) VALUES ($1, $2, $3, $4, now(), $5, $6, $7, $8, NULLIF($9,$13), NULLIF($10,$13), NULLIF($11,$13), NULLIF($12,$13))', 
            [userid, authorname, title, description, sightingLocation, sightingTime, imageURL, picture, _class, order, family, genus, blank], 
            (error, result) => {
            if (error) {
              response.send(error.message)
            }
            response.status(201).send(`Post with title: ${title} added`)
          })
          }
          else {
            response.status(404).send('User not found')
          }
        })
  } catch(error) {
    console.log(error)
    response.status(401).send("Failed to add post")
  }
}


const updatePostInfo = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid
  const { title, description } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    if(title!=''){
      db.dbConnect().query(
        'UPDATE posts SET title = $1 WHERE postid = $2',
        [title, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount == 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    if(description!=''){
      db.dbConnect().query(
        'UPDATE posts SET description = $1 WHERE postid = $2',
        [description, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount != 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    response.status(200).send(`Post with postid: ${postid} modified`)

  } catch(error) {
    response.send(error.message)
  }
}

const updatePostClassification = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid
  const { _class, order, family, genus } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    if(_class!=''){
      db.dbConnect().query(
        'UPDATE posts SET class = $1 WHERE postid = $2',
        [_class, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount != 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    if(order!=''){
      db.dbConnect().query(
        'UPDATE posts SET _order = $1 WHERE postid = $2',
        [order, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount != 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    if(family!=''){
      db.dbConnect().query(
        'UPDATE posts SET family = $1 WHERE postid = $2',
        [family, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount != 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    if(genus!=''){
      db.dbConnect().query(
        'UPDATE posts SET genus = $1 WHERE postid = $2',
        [genus, postid],
        (error, result) => {
          if (error) {
            response.send(error.message)
          }
          else if (result.rowCount != 1) {
            response.status(404).send('Post not found')
          }
        }
      )
    }
    response.status(200).send(`Post with postid: ${postid} modified`)

  } catch(error) {
    response.send(error.message)
  }
}

const deletePost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    const result = jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' })
    const userid = result.userid
    db.dbConnect().query('DELETE FROM posts WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if (result.rowCount == 1) {
        if (error) {
          response.send(error.message)
        }
        db.dbConnect().query(
          'UPDATE users SET level = level - 1 WHERE userid = $1'), [userid]
        response.status(200).send(`Post with id ${postid} deleted`)

      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const verifyPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET verified = TRUE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} verified`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const flagPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET flagged = TRUE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} flagged`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const unFlagPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET flagged = FALSE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} unflagged`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

//functions to be exported
module.exports = {
  viewAllPosts,
  viewAllVerifiedPosts,
  viewAllUnverifiedPosts,
  viewPost,
  viewUserPosts,
  viewPostIdByTitle,
  addPost,
  updatePostInfo,
  updatePostClassification,
  deletePost,
  verifyPost,
  flagPost,
  unFlagPost
}
