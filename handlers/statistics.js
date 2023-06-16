const db = require('../database')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

dotenv.config()

const searchSpecies = async (request, response) => {
  try {
    const { species, startTime, endTime, sightingLocation } = request.query;

    const countQuery = `
      SELECT COUNT(*) AS count, MAX(posts.sightingtime) AS latest_sightingtime
      FROM posts
      WHERE title = $1 AND verified = true
        AND sightingtime >= $2 AND sightingtime <= $3
        ${sightingLocation !== '' ? 'AND sightinglocation = $4' : ''}
    `;

    const countValues = [species, startTime, endTime];
    if (sightingLocation !== '') {
      countValues.push(sightingLocation);
    }

    db.dbConnect().query(countQuery, countValues, (error, countResult) => {
      if (error) {
        throw error;
      }

      if (countResult.rows.length > 0) {
        const { count, latest_sightingtime } = countResult.rows[0];

        SpeciesLastSightingLocation(species, startTime, endTime, sightingLocation, (err, locationResult) => {
          if (err) {
            throw err;
          }

          if (locationResult.rows.length > 0) {
            const { latest_sightinglocation } = locationResult.rows[0];
            response.status(200).json({ count, latest_sightingtime, latest_sightinglocation });
          } else {
            response.status(404).send('No entries found');
          }
        });
      } else {
        response.status(404).send('No entries found');
      }
    });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error' });
  }
};

const SpeciesLastSightingLocation = (species, startTime, endTime, sightingLocation, callback) => {
  let locationQuery = `
    SELECT posts.sightinglocation
    FROM posts
    WHERE title = $1 AND verified = true
      AND sightingtime >= $2 AND sightingtime <= $3
      ${sightingLocation !== '' ? 'AND sightinglocation = $4' : ''}
    ORDER BY sightingtime DESC
    LIMIT 1
  `;

  const locationValues = [species, startTime, endTime];
  if (sightingLocation !== '') {
    locationValues.push(sightingLocation);
  }

  db.dbConnect().query(locationQuery, locationValues, callback);
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