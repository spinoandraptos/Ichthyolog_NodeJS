const db = require('../database')
const argon2 = require('argon2')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()
  
  const viewUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
  
    try {
    const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
    const userid = result.userid  
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
    response.status(401).send("Bad Token")
  }
}

const viewUserbyID = async(request, response) => {
  const userid = request.params.userid
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
} 
  
  
  const addUser = async(request, response) => {
    const { username, password, email } = request.body
    const hashedPassword = await argon2.hash(password)
  
    db.dbConnect().query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', 
    [username, hashedPassword, email], 
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User with username: ${username} added`)
    })
  }
  
  const updateUserProfile = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { username, password, email } = request.body
    const hashedPassword = await argon2.hash(password)

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET username = $1, password = $2, email = $3 WHERE userid = $4',
        [username, hashedPassword, email, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserUsername = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { username } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET username = $1 WHERE userid = $2',
        [username, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserPassword = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { password } = request.body
    const hashedPassword = await argon2.hash(password)

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET password = $1 WHERE userid = $2',
        [hashedPassword, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserEmail = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { email } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET email = $1 WHERE userid = $2',
        [email, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserUsernamePassword = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { username, password } = request.body
    const hashedPassword = await argon2.hash(password)

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET username = $1, password = $2 WHERE userid = $3',
        [username, hashedPassword, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserUsernameEmail = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { username, email } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET username = $1, email = $2 WHERE userid = $3',
        [username, email, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserEmailPassword = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { email, password } = request.body
    const hashedPassword = await argon2.hash(password)

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET email = $1, password = $2 WHERE userid = $3',
        [email, hashedPassword, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserPic = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { profilepic } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'UPDATE users SET profilepic = $1 WHERE userid = $2',
        [profilepic, userid],
        (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} modified`)
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

  const updateUserLevel = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { level } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'SELECT level FROM users WHERE userid = $1', [userid], (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
            const new_level = results.rows[0].level + level
            db.dbConnect().query(
              'UPDATE users SET level = $1 WHERE userid = $2',
              [new_level, userid],
              (error, results) => {
                if (error) {
                  throw error
                }
                if(results.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )
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

  const updateUserPost = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { post_number } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'SELECT totalposts FROM users WHERE userid = $1', [userid], (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
            const new_posts = results.rows[0].totalposts + post_number
            db.dbConnect().query(
              'UPDATE users SET totalposts = $1 WHERE userid = $2',
              [new_posts, userid],
              (error, results) => {
                if (error) {
                  throw error
                }
                if(results.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )
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

  const updateUserSpecies = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { species_number } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid  
      db.dbConnect().query(
        'SELECT speciescount FROM users WHERE userid = $1', [userid], (error, results) => {
          if (error) {
            throw error
          }
          if(results.rowCount == 1){
            const new_level = results.rows[0].speciescount + species_number
            db.dbConnect().query(
              'UPDATE users SET speciescount = $1 WHERE userid = $2',
              [new_level, userid],
              (error, results) => {
                if (error) {
                  throw error
                }
                if(results.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )
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
  
  const deleteUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      const userid = result.userid 
      db.dbConnect().query('DELETE FROM users WHERE userid = $1', [userid], (error, results) => {
        if (error) {
          throw error
        }
        if(results.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} deleted`)
        }
        else {
          response.status(404).send('User not found')
        }
      })
    } catch {
      response.status(401).send("Bad Token")
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
      jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'});
      response.status(200).send('Valid Token')
    } catch {
      response.status(401).send('Bad Token')
    }
  }
  

  //functions to be exported
  module.exports = {
    viewUser,
    viewUserbyID,
    addUser,
    updateUserProfile,
    updateUserUsername,
    updateUserEmail,
    updateUserPassword,
    updateUserEmailPassword,
    updateUserUsernamePassword,
    updateUserUsernameEmail,
    updateUserPic,
    updateUserLevel,
    updateUserPost,
    updateUserSpecies,
    deleteUser,
    loginUser,
    logoffUser
  }
