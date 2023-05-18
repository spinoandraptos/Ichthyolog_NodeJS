const db = require('../database')

const retrieveUsers = (request, response) => {
  db.dbConnect().query('SELECT * FROM users ORDER BY userid ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  
  const retrieveUserByID = (request, response) => {
    const userid = parseInt(request.params.userid)
  
    db.dbConnect().query('SELECT * FROM users WHERE userid = $1', [userid], (error, result) => {
      if (error) {
        throw error
      }
      response.status(200).json(result.rows)
    })
  }
  
  
  const addUser = (request, response) => {
    const { username, password, email } = request.body
  
    db.dbConnect().query('INSERT INTO users (username, password, email) VALUES ($1, crypt($2, gen_salt('bf')), $3)', [username, password, email], 
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with username: ${username}`)
    })
  }
  
  const updateUser = (request, response) => {
    const userid = parseInt(request.params.userid)
    const { username, password, email } = request.body
  
    db.dbConnect().query(
      'UPDATE users SET username = $1, password = $2, email = $3 WHERE userid = $4',
      [username, password, email, userid],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${userid}`)
      }
    )
  }
  
  const deleteUser = (request, response) => {
    const userid = parseInt(request.params.userid)
  
    db.dbConnect().query('DELETE FROM users WHERE userid = $1', [userid], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${userid}`)
    })
  }

  //functions to be exported
  module.exports = {
    retrieveUsers,
    retrieveUserByID,
    addUser,
    updateUser,
    deleteUser
  }
