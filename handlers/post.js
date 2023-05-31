const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()
  
const viewAllPosts = async(request, response) => {

    db.dbConnect().query('SELECT * FROM posts', (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount != 0){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Posts not found')
      }
    })
  }

  const viewUserPosts = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
  
    try {
    const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
    const userid = result.userid  
    db.dbConnect().query('SELECT * FROM posts WHERE userid = $1', [userid], (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount != 0){
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
    const postid = request.params.id
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
    const { title, description, uploadtime, sightingtime, sightinglocation, pic } = request.body
  
    try {
        const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
        const userid = result.userid 
        const authorname = result.username 
        db.dbConnect().query('INSERT INTO posts (userid, authorname, title, description, time, sightinglocation, sightingtime, imageurl) VALUES ($1, $2, $3, $4)', 
        [userid, authorname, title, description, uploadtime, sightinglocation, sightingtime, pic], 
        (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Post with title: ${title} added`)
        })
    } catch {
        response.status(401).send("Bad Token")
    }
}
    
  
  const updatePost = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { postid, title, description, pic } = request.body

    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      db.dbConnect().query(
        'UPDATE users SET title = $1, description = $2, pic = $3 WHERE postid = $4',
        [title, description, pic, postid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(result.rowCount == 1){
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

  const deletePost = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 
    const { postid, title } = request.body

    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      db.dbConnect().query('DELETE FROM posts WHERE postid = $1', [postid], (error, results) => {
        if (error) {
          throw error
        }
        if(result.rowCount == 1){
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
