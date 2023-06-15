const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const searchSpecies = async (request, response) => {
    try {
      const { species, startTime, endTime, sightingLocation } = request.query;
  
      let query = `
        WITH latest_sightings AS (
          SELECT postid, sightinglocation
          FROM posts
          WHERE title = $1 AND verified = true
            AND sightingtime >= $2 AND sightingtime <= $3
            ${sightingLocation !== '' ? 'AND sightinglocation = $4' : ''}
          ORDER BY sightingtime DESC
          LIMIT 1
        )
        SELECT COUNT(*) AS count, MAX(posts.sightingtime) AS latest_sightingtime,
          latest_sightings.sightinglocation AS latest_sightinglocation
        FROM posts
        JOIN latest_sightings ON posts.postid = latest_sightings.postid
        WHERE title = $1 AND verified = true
          AND sightingtime >= $2 AND sightingtime <= $3
      `;
  
      const values = [species, startTime, endTime];
      if (sightingLocation !== '') {
        values.push(sightingLocation);
      }
  
      db.dbConnect().query(query, values, (error, result) => {
        if (error) {
          throw error;
        }
  
        const { count, latest_sightingtime, latest_sightinglocation } = result.rows[0];
  
        if (count > 0) {
          response.status(200).json({ count, latest_sightingtime, latest_sightinglocation });
        } else {
          response.status(404).send('No entries found');
        }
      });
    } catch (error) {
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  
  

const searchClass = async (request, response) => {
    try {
        const class_ = request.params.class_;

        const query = `
        SELECT DISTINCT title
        FROM posts
        WHERE class = $1
          AND verified = true
        ORDER BY title ASC
      `;

        const values = [class_];

        db.dbConnect().query(query, values, (error, result) => {
            if (error) {
                throw error;
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}

const searchOrder = async (request, response) => {
    try {
        const order = request.params.order;

        const query = `
        SELECT DISTINCT title
        FROM posts
        WHERE order = $1
          AND verified = true
        ORDER BY title ASC
      `;

        const values = [order];

        db.dbConnect().query(query, values, (error, result) => {
            if (error) {
                throw error;
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}

const searchFamily = async (request, response) => {
    try {
        const family = request.params.family;

        const query = `
        SELECT DISTINCT title
        FROM posts
        WHERE family = $1
          AND verified = true
        ORDER BY title ASC
      `;

        const values = [family];

        db.dbConnect().query(query, values, (error, result) => {
            if (error) {
                throw error;
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}

const searchGenus = async (request, response) => {
    try {
        const genus = request.params.genus;

        const query = `
        SELECT DISTINCT title
        FROM posts
        WHERE genus = $1
          AND verified = true
        ORDER BY title ASC
      `;

        const values = [genus];

        db.dbConnect().query(query, values, (error, result) => {
            if (error) {
                throw error;
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    searchSpecies,
    searchClass,
    searchOrder,
    searchFamily,
    searchGenus
}