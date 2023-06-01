const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const viewAllPosts = async (request, response) => {

  db.dbConnect().query('SELECT * FROM posts', (error, result) => {
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
    db.dbConnect().query('SELECT * FROM posts WHERE userid = $1', [userid], (error, result) => {
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
  } catch {
    response.status(401).send("Bad Token")
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
    const { title, description, sightingLocation, sightingTime, imageURL } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
        const userid = result.userid  
        const authorname = result.username
        db.dbConnect().query('INSERT INTO posts (userid, authorname, title, description, time, sightinglocation, sightingtime, imageurl) VALUES ($1, $2, $3, $4, now(), $5, $6, $7)', 
        [userid, authorname, title, description, sightingLocation, sightingTime, imageURL], 
        (error, results) => {
        if (error) {
          throw error
        }
        response.status(201).send(`Post with title: ${title} added`)
      })
  } catch(error) {
    console.log(error)
    response.status(401).send("Failed to add post")
  }
}


const updatePost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const { postid, title, description, pic } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query(
      'UPDATE users SET title = $1, description = $2, pic = $3 WHERE postid = $4',
      [title, description, pic, postid],
      (error, results) => {
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
  } catch {
    response.status(401).send("Bad Token")
  }
}

const deletePost = async (request, response) => {
  const jwt_auth = request.get('Authorisation')
  const { postid, title } = request.body

  try {
    jwt.verify(jwt_auth, process.env.SECRETKEY, { algorithm: 'HS256' });
    db.dbConnect().query('DELETE FROM posts WHERE postid = $1', [postid], (error, results) => {
      if (error) {
        throw error
      }
      if (result.rowCount == 1) {
        response.status(200).send(`Post with title: ${title} deleted`)
      }
      else {
        response.status(404).send('User not found')
      }
    })
  } catch {
    response.status(401).send("Bad Token")
  }
}

//functions to be exported
module.exports = {
  viewAllPosts,
  viewPost,
  viewUserPosts,
  addPost,
  updatePost,
  deletePost
}
