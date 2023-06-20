const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllPosts = async (request, response) => {

  db.dbConnect().query('SELECT * FROM posts ORDER BY flagged desc, time desc ', (error, result) => {
    if (error) {
      throw error
    }
    if (result.rowCount != 0) {
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
      throw error
    }
    if (result.rowCount != 0) {
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
      throw error
    }
    if (result.rowCount != 0) {
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
        throw error
      }
      if (result.rowCount != 0) {
        response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Posts not found')
      }
    })
  } catch(error) {
    response.status(401).send("User not authorised")
  }
}

  const viewPost = async(request, response) => {
    const postid = request.params.postid
    db.dbConnect().query('SELECT * FROM posts WHERE postid = $1', [postid], (error, result) => {
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
            throw error
          }
          if(result.rowCount == 1){
            var blank = ''
            const picture = result.rows[0].profilepic
            db.dbConnect().query('UPDATE users SET totalposts = totalposts + 1 WHERE userid = $1'), [userid]
            db.dbConnect().query('UPDATE users SET level = level + 1 WHERE userid = $1'), [userid]
            db.dbConnect().query('INSERT INTO posts (userid, authorname, title, description, time, sightinglocation, sightingtime, imageurl, authorpicurl, class, _order, family, genus) VALUES ($1, $2, $3, $4, now(), $5, $6, $7, $8, NULLIF($9,$13), NULLIF($10,$13), NULLIF($11,$13), NULLIF($12,$13))', 
            [userid, authorname, title, description, sightingLocation, sightingTime, imageURL, picture, _class, order, family, genus, blank], 
            (error, result) => {
            if (error) {
              throw error
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


const updatePost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid
  const { title, description, pic } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query(
      'UPDATE posts SET title = $1, description = $2, pic = $3 WHERE postid = $4',
      [title, description, pic, postid],
      (error, result) => {
        if (error) {
          throw error
        }
        if (result.rowCount == 1) {
          response.status(200).send(`post with title: ${title} modified`)
        }
        else {
          response.status(404).send('User not found')
        }
      }
    )
  } catch(error) {
    response.status(401).send("User not authorised")
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
        throw error
      }
      if (result.rowCount == 1) {
        db.dbConnect().query(
          'UPDATE users SET level = level - 1 WHERE userid = $1'), [userid]
        response.status(200).send(`Post with id ${postid} deleted`)

      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.status(401).send("User not authorised")
  }
}

const verifyPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET verified = TRUE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} verified`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.status(401).send("User not authorised")
  }
}

const flagPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET flagged = TRUE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} flagged`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.status(401).send("User not authorised")
  }
}

const unFlagPost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const postid = request.params.postid

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('UPDATE posts SET flagged = FALSE WHERE postid = $1', [postid], (error, result) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with id ${postid} unflagged`)
      }
      else {
        response.status(404).send('Post not found')
      }
    })
  } catch(error) {
    response.status(401).send("User not authorised")
  }
}

//functions to be exported
module.exports = {
  viewAllPosts,
  viewAllVerifiedPosts,
  viewAllUnverifiedPosts,
  viewPost,
  viewUserPosts,
  addPost,
  updatePost,
  deletePost,
  verifyPost,
  flagPost,
  unFlagPost
}
