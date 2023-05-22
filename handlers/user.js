const db = require('../database')
const argon2 = require('argon2')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

  const viewUsers = async (request, response) => {
    db.dbConnect().query('SELECT * FROM users ORDER BY userid ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  
  const viewUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const userid = parseInt(request.params.userid)
  
    try {
    jwt.verify(jwt_auth, proc.env.SECRETKEY, {algorithm: 'HS256'});
    db.dbConnect().query('SELECT * FROM users WHERE userid = $1', [userid], (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('User not found')
      }
    })
  } catch {
    response.status(401);
    response.send("Bad Token");
  }
}
  
  
  const addUser = async(request, response) => {
    const { username, password, email } = request.body
    const hashedPassword = await argon2.hash(password)
    console.log(hashedPassword)
  
    db.dbConnect().query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', 
    [username, hashedPassword, email], 
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User with username: ${username} added`)
    })
  }
  
  const updateUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const userid = parseInt(request.params.userid)
    const { username, password, email } = request.body
    const hashedPassword = await argon2.hash(password)

    try {
      jwt.verify(jwt_auth, proc.env.SECRETKEY, {algorithm: 'HS256'});
      db.dbConnect().query(
        'UPDATE users SET username = $1, password = $2, email = $3 WHERE userid = $4',
        [username, hashedPassword, email, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(result.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
          }
          else {
            response.status(404).send('User not found')
          }
        }
      )
    } catch {
      response.status(401);
      response.send("Bad Token");
    }
  }
  
  const deleteUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 
    const userid = parseInt(request.params.userid)

    try {
      jwt.verify(jwt_auth, proc.env.SECRETKEY, {algorithm: 'HS256'});
      db.dbConnect().query('DELETE FROM users WHERE userid = $1', [userid], (error, results) => {
        if (error) {
          throw error
        }
        if(result.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} deleted`)
        }
        else {
          response.status(404).send('User not found')
        }
      })
    } catch {
      response.status(401);
      response.send("Bad Token");
    }
  }

  const loginUser = async(request, response) => {
    const { email, username, password } = request.body

    db.dbConnect().query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username], async(error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount == 1){
        if (await argon2.verify(result.rows[0].password, password)){
          var token = jwt.sign({username: result.rows[0].username, userid:result.rows[0].userid}, process.env.SECRETKEY, {expiresIn: "3h", algorithm: "HS256"} );
          console.log(token)
          response.status(200).send(token)
        }
        else {
          response.status(404).send('Password Incorrect')
        }
      }
      else {
        response.status(400).send('User not found')
      }
    })
  }

  const logoffUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 

    try {
      jwt.verify(jwt_auth, proc.env.SECRETKEY, {algorithm: 'HS256'});
      response.status(200)
    } catch {
      response.status(401)
      response.send('Bad Token')
    }
  }
  

  //functions to be exported
  module.exports = {
    viewUsers,
    viewUser,
    addUser,
    updateUser,
    deleteUser,
    loginUser,
    logoffUser
  }
