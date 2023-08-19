const db = require('../database')
const argon2 = require('argon2')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()
  
  const viewOwnUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
  
    try {
    const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
    const userid = result.userid  
    db.clientPool.query('SELECT * FROM users WHERE userid = $1', [userid], (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if(result.rowCount == 1){
      response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('User not found')
      }
    })
  } catch(error) {
    response.send(error.message)
  }
}

const viewAnyUserbyID = async(request, response) => {
  const userid = request.params.userid
  db.clientPool.query('SELECT * FROM users WHERE userid = $1', [userid], (error, result) => {
    if (error) {
      response.send(error.message)
    }
    else if(result.rowCount == 1){
    response.status(200).json(result.rows)
    }
    else {
      response.status(404).send('User not found')
    }
  })
} 

const viewAllUsernames = async(request, response) => {
  const jwt_auth = request.get('Authorisation')
  try{
    jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
    db.clientPool.query('SELECT username FROM users', (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount != 0) {
        response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Users not found')
      }
    })
  }
  catch(error) {
    response.send(error.message)
  }
} 
  
  
  const addUser = async(request, response) => {
    const { username, password, email } = request.body
    const hashedPassword = await argon2.hash(password)
  
    try{
    db.clientPool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', 
    [username, hashedPassword, email], 
    (error, result) => {
      if(error){
        response.send(error.message)
      } else {
      response.status(201).send(`User with username: ${username} added`)
      }
    })}
    catch(error) {
      response.send(error.message)
    }
  }

  const updateUsername = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const {username, oldPassword} = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
      db.clientPool.query('SELECT password FROM users WHERE userid = $1', [userid], async(error, result) => {
        if (error) {
          response.send(error.message)
          
        }
        else if(result.rowCount == 1){
          if (await argon2.verify(result.rows[0].password, oldPassword)){
            if(username != ''){
              db.clientPool.query(
                'UPDATE users SET username = $1 WHERE userid = $2',
                [username, userid],
                (error, result) => {
                  if (error) {
                    response.send(error.message)                    
                  }
                  else if(result.rowCount != 1){
                    response.send('User not found')                   
                  }
                  else {
                    response.status(200).send('User modified')
                  }
                }
              )
            }
            else {
              response.status(200).send(`No changes made`)
            }
          }
          else {
            response.send('Incorrect password')
          }
        }
        else {
          response.send('User not found')
        }
    })
    } catch(error) {
      response.send(error.message)
    }
  }

  const updateUserEmail = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const {email, oldPassword} = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
      db.clientPool.query('SELECT password FROM users WHERE userid = $1', [userid], async(error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          if (await argon2.verify(result.rows[0].password, oldPassword)){
            if(email != ''){
              db.clientPool.query(
                'UPDATE users SET email = $1 WHERE userid = $2',
                [email, userid],
                (error, result) => {
                  if (error) {
                    response.send(error.message)
                  }
                  else if(result.rowCount != 1){
                    response.status(404).send('User not found')                   
                  }
                  else {
                    response.status(200).send('User modified')
                  }
                }
              )
            }
            else {
              response.status(200).send(`No changes made`)
            }
          }
          else {
            response.send('Incorrect password')
          }
        }
        else {
          response.send('User not found')
        }
    })
    } catch(error) {
      response.send(error.message)
    }
  }

  const updateUserPassword = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const {newPassword, oldPassword} = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
      db.clientPool.query('SELECT password FROM users WHERE userid = $1', [userid], async(error, result) => {
        if (error) {
          response.send(error.message)
        }
        else if(result.rowCount == 1){
          if (await argon2.verify(result.rows[0].password, oldPassword)){
            if(newPassword != ''){
              const hashedNewPassword = await argon2.hash(newPassword)
              db.clientPool.query(
                'UPDATE users SET password = $1 WHERE userid = $2',
                [hashedNewPassword, userid],
                (error, result) => {
                  if (error) {
                    response.send(error.message)                   
                  }
                  else if(result.rowCount != 1){
                    response.status(404).send('User not found')                    
                  }
                  else {
                    response.status(200).send('User modified')
                  }
                }
              )
            }
            else {
              response.status(200).send(`No changes made`)
            }
          }
          else {
            response.send('Incorrect password')
          }
        }
        else {
          response.send('User not found')
        }
    })
    } catch(error) {
      response.send(error.message)
    }
  }
  
  
  const updateUserPic = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { profilepic } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
      db.clientPool.query(
        'UPDATE users SET profilepic = $1 WHERE userid = $2',
        [profilepic, userid],
        (error, result) => {
          if (error) {
            response.send(error.message)           
          }
          else if(result.rowCount == 1){
            db.clientPool.query(
              'UPDATE posts SET authorpicurl = $1 WHERE userid = $2',
              [profilepic, userid],
              (error) => {
                if (error) {
                  response.send(error.message)                
                }
                else {
                  db.clientPool.query(
                  'UPDATE comments SET authorpic = $1 WHERE authorid = $2',
                  [profilepic, userid],
                  (error) => {
                    if (error) {
                      response.send(error.message)                    
                    } else {
                      db.clientPool.query(
                        'UPDATE notifications SET senderprofilepic = $1 WHERE senderid = $2',
                        [profilepic, userid],
                        (error) => {
                          if (error) {
                            response.send(error.message)                    
                          } else {
                          response.status(200).send(`User with userid: ${userid} modified`)
                          }
                        })
                    }
                })
              }
             })
          }
          else {
            response.status(404).send('User not found')
          }
        }
      )
    } catch(error) {
      response.send(error.message)
    }
  }

  const updateUserLevel = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { level } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
            db.clientPool.query(
              'UPDATE users SET level = level + $1 WHERE userid = $2',
              [level, userid],
              (error, result) => {
                if (error) {
                  response.send(error.message)
                }
                if(result.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )
    } catch(error) {
      response.send(error.message)
    }
  }

  const updateUserPost = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { post_number } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
            db.clientPool.query(
              'UPDATE users SET totalposts = totalposts + $1 WHERE userid = $2',
              [post_number, userid],
              (error, result) => {
                if (error) {
                  response.send(error.message)
                }
                if(result.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )

    } catch(error) {
      response.send(error.message)
    }
  }

  const updateUserSpecies = async(request, response) => {
    const jwt_auth = request.get('Authorisation')
    const { species_number } = request.body

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid  
            db.clientPool.query(
              'UPDATE users SET speciescount = speciescount + $1 WHERE userid = $2',
              [species_number, userid],
              (error, result) => {
                if (error) {
                  response.send(error.message)
                }
                if(result.rowCount == 1){
                response.status(200).send(`User with userid: ${userid} modified`)
                }
                else {
                  response.status(404).send('User not found')
                }
              }
            )
    } catch(error) {
      response.send(error.message)
    }
  }
  
  const deleteUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 

    try {
      const result = jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      const userid = result.userid 
      db.clientPool.query('DELETE FROM users WHERE userid = $1', [userid], (error, result) => {
        if (error) {
          response.send(error.message)
        }
        if(result.rowCount == 1){
          response.status(200).send(`User with userid: ${userid} deleted`)
        }
        else {
          response.status(404).send('User not found')
        }
      })
    } catch(error) {
      response.send(error.message)
    }
  }

  const loginUser = async(request, response) => {
    const { email, username, password } = request.body

    db.clientPool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username], async(error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if(result.rowCount == 1){
        if (await argon2.verify(result.rows[0].password, password)){
          var token = jwt.sign({username: result.rows[0].username, userid:result.rows[0].userid}, process.env.SECRETKEY, {algorithm: "HS256"} )
          response.status(200).send(token)
        }
        else {
          response.send('Password incorrect')
        }
      }
      else {
        response.send('User not found')
      }
    })
  }

  const logoffUser = async(request, response) => {
    const jwt_auth = request.get('Authorisation') 

    try {
      jwt.verify(jwt_auth, process.env.SECRETKEY, {algorithm: 'HS256'})
      response.status(200).send('Valid token')
    } catch(error) {
      response.send(error.message)
    }
  }
  

  //functions to be exported
  module.exports = {
    viewOwnUser,
    viewAnyUserbyID,
    viewAllUsernames,
    addUser,
    updateUsername,
    updateUserPassword,
    updateUserEmail,
    updateUserPic,
    updateUserLevel,
    updateUserPost,
    updateUserSpecies,
    deleteUser,
    loginUser,
    logoffUser
  }
