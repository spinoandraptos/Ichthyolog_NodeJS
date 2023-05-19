const db = require('../database')
const argon2 = require('argon2')

  const viewUsers = async (request, response) => {
    db.dbConnect().query('SELECT * FROM users ORDER BY userid ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  
  const viewUser = (request, response) => {
    const userid = parseInt(request.params.userid)
  
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
  
  
  const addUser = (request, response) => {
    const { username, password, email } = request.body
    const hashedPassword = argon2.hash(password);
  
    db.dbConnect().query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', 
    [username, hashedPassword, email], 
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User with username: ${username} added`)
    })
  }
  
  const updateUser = (request, response) => {
    const userid = parseInt(request.params.userid)
    const { username, password, email } = request.body
    const hashedPassword = argon2.hash(password);
  
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
  }
  
  const deleteUser = (request, response) => {
    const userid = parseInt(request.params.userid)
  
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
  }

  const loginUser = (request, response) => {
    const { email, username, password } = request.body

    db.dbConnect().query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username], (error, result) => {
      if (error) {
        throw error
      }
      if(result.rowCount == 1){
        if (argon2.verify(password, result.rows[0].password)){
          response.status(200).send('Successful login')
        }
        else {
          response.status(404).send('Password Incorrect')
        }
      }
      else {
        response.status(404).send('User not found')
      }
    })
  }
  

  //functions to be exported
  module.exports = {
    viewUsers,
    viewUser,
    addUser,
    updateUser,
    deleteUser,
    loginUser
  }
