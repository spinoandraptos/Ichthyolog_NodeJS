const db = require('../database')
const dotenv = require('dotenv')

dotenv.config()

const searchAll = async (request, response) => {
  try{
    const {sightingLocation} = request.query
    
    let query = `SELECT DISTINCT title FROM posts WHERE verified = true`

    const values = []

    if (sightingLocation !== '') {
      query += ` AND sightinglocation = $1`
      values.push(sightingLocation)
    }

    query += ` ORDER BY title ASC`
    db.clientPool.query(query, values, (error, result) => {
      if (error) {
        response.send(error.message)
      }
      else if (result.rowCount != 0) {
        response.status(200).json(result.rows)
      }
      else {
        response.status(404).send('Posts not found')
      }
    })
  }
  catch(error) {
    response.send(error.message)
  }
}

const searchSpeciesName = async (request, response) => {
  try {
      const species = request.params.species

      const query = `
      SELECT DISTINCT title
      FROM posts
      WHERE title ILIKE $1
        AND verified = true
      ORDER BY title ASC
    `

      const values = [`%${species}%`]

      db.clientPool.query(query, values, (error, result) => {
          if (error) {
              response.send(error.message)
          }

          if (result.rowCount > 0) {
              response.status(200).json(result.rows)
          } else {
              response.status(404).send('No entries found')
          }
      })
  } catch(error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
  }
}

const searchSpecies = async (request, response) => {
  try {
      const { species, startTime, endTime, sightingLocation } = request.query;

      let query = `
      SELECT COUNT(*) AS count, MAX(sightingtime) AS latest_sightingtime,
        (SELECT sightinglocation FROM posts
         WHERE title ILIKE $1 AND verified = true
           AND sightingtime >= $2 AND sightingtime <= $3
      `;

      const values = [`%${species}%`, startTime, endTime];

      if (sightingLocation !== '') {
          query += ` AND sightinglocation = $4`;
          values.push(sightingLocation);
      }

      query += `
         ORDER BY sightingtime DESC
         LIMIT 1) AS latest_sightinglocation
      FROM posts
      WHERE title ILIKE $1 AND verified = true
      AND sightingtime >= $2 AND sightingtime <= $3
      `;

      db.clientPool.query(query, values, (error, result) => {
          if (error) {
              response.send(error.message);
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
}



const searchClass = async (request, response) => {
    try {
        const { class_, sightingLocation } = request.query

        let query = `
        SELECT DISTINCT title
        FROM posts
        WHERE class = $1
          AND verified = true
      `
        const values = [class_]

        if (sightingLocation !== '') {
            query += ` AND sightinglocation = $2`
            values.push(sightingLocation)
        }

        query += ` ORDER BY title ASC`

        db.clientPool.query(query, values, (error, result) => {
            if (error) {
                response.send(error.message)
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows)
            } else {
                response.status(404).send('No entries found')
            }
        })
    } catch(error) {
        console.error('Error executing query:', error)
        response.status(500).json({ error: 'Internal server error' })
    }
}

const searchOrder = async (request, response) => {
    try {
      const { order, sightingLocation } = request.query

      let query = `
      SELECT DISTINCT title
      FROM posts
      WHERE _order = $1
        AND verified = true
    `
      const values = [order]

      if (sightingLocation !== '') {
          query += ` AND sightinglocation = $2`
          values.push(sightingLocation)
      }

      query += ` ORDER BY title ASC`

        db.clientPool.query(query, values, (error, result) => {
            if (error) {
                response.send(error.message)
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows)
            } else {
                response.status(404).send('No entries found')
            }
        })
    } catch(error) {
        console.error('Error executing query:', error)
        response.status(500).json({ error: 'Internal server error' })
    }
}

const searchFamily = async (request, response) => {
    try {
      const { family, sightingLocation } = request.query

      let query = `
      SELECT DISTINCT title
      FROM posts
      WHERE family = $1
        AND verified = true
    `
      const values = [family]

      if (sightingLocation !== '') {
          query += ` AND sightinglocation = $2`
          values.push(sightingLocation)
      }

      query += ` ORDER BY title ASC`

        db.clientPool.query(query, values, (error, result) => {
            if (error) {
                response.send(error.message)
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows)
            } else {
                response.status(404).send('No entries found')
            }
        })
    } catch(error) {
        console.error('Error executing query:', error)
        response.status(500).json({ error: 'Internal server error' })
    }
}

const searchGenus = async (request, response) => {
    try {
      const { genus, sightingLocation } = request.query

      let query = `
      SELECT DISTINCT title
      FROM posts
      WHERE genus = $1
        AND verified = true
    `
      const values = [genus]

      if (sightingLocation !== '') {
          query += ` AND sightinglocation = $2`
          values.push(sightingLocation)
      }

      query += ` ORDER BY title ASC`

        db.clientPool.query(query, values, (error, result) => {
            if (error) {
                response.send(error.message)
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows)
            } else {
                response.status(404).send('No entries found')
            }
        })
    } catch(error) {
        console.error('Error executing query:', error)
        response.status(500).json({ error: 'Internal server error' })
    }
}

const searchFamilyCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT family, COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY family
        ORDER BY family ASC
      `
  
      db.clientPool.query(query, (error, result) => {
        if (error) {
          response.send(error.message)
        }
  
        response.status(200).json(result.rows)
      })
    } catch(error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }

  const searchClassCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT class, COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY class
        ORDER BY class ASC
      `
  
      db.clientPool.query(query, (error, result) => {
        if (error) {
          response.send(error.message)
        }
  
        response.status(200).json(result.rows)
      })
    } catch(error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }
  
  const searchOrderCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT "_order", COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY "_order"
        ORDER BY "_order" ASC
      `
  
      db.clientPool.query(query, (error, result) => {
        if (error) {
          response.send(error.message)
        }
  
        response.status(200).json(result.rows)
      })
    } catch(error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }

  const searchGenusCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT genus, COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY genus
        ORDER BY genus ASC
      `
  
      db.clientPool.query(query, (error, result) => {
        if (error) {
          response.send(error.message)
        }
  
        response.status(200).json(result.rows)
      })
    } catch(error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }

  const getSpeciesSightingsByHour = async (request, response) => {
    try {
      const species = request.params.species
  
      const query = `SELECT gs.hour_interval,
      COALESCE(counts.sightings_count, 0) AS sightings_count
FROM (
 SELECT generate_series(
          DATE_TRUNC('hour', NOW() - INTERVAL '24 hours'),
          DATE_TRUNC('hour', NOW()),
          INTERVAL '1 hour'
        ) AS hour_interval
) AS gs
LEFT JOIN (
 SELECT DATE_TRUNC('hour', sightingtime) AS hour,
        COUNT(*) AS sightings_count
 FROM posts
 WHERE title = $1
   AND sightingtime >= NOW() - INTERVAL '24 hours'
   AND sightingtime <= NOW()
   AND verified = true
 GROUP BY DATE_TRUNC('hour', sightingtime)
) AS counts ON gs.hour_interval = counts.hour
ORDER BY gs.hour_interval ASC
`
  
      const values = [species]
  
      db.clientPool.query(query, values, (error, result) => {
        if (error) {
          console.error('Error executing query:', error)
          response.status(500).json({ error: 'Internal server error' })
          return
        }
  
        response.status(200).json(result.rows)
      })
    } catch (error) {
      console.error('Error executing query:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }
  
  const getSpeciesCountWeek = async (request, response) => {
    try {
      const species = request.params.species;
      
      const query = `
        SELECT gs.day,
               COALESCE(counts.sightings_count, 0) AS sightings_count
        FROM (
          SELECT generate_series(
                   CURRENT_DATE - INTERVAL '6 days',
                   CURRENT_DATE,
                   '1 day'
                 ) AS day
        ) AS gs
        LEFT JOIN (
          SELECT DATE_TRUNC('day', sightingtime) AS day,
                 COUNT(*) AS sightings_count
          FROM posts
          WHERE title = $1
            AND sightingtime >= CURRENT_DATE - INTERVAL '6 days'
            AND sightingtime <= CURRENT_DATE
            AND verified = true
          GROUP BY DATE_TRUNC('day', sightingtime)
        ) AS counts ON gs.day = counts.day
        ORDER BY gs.day ASC
      `;
      
      const values = [species];
      
      db.clientPool.query(query, values, (error, result) => {
        if (error) {
          console.error('Error executing query:', error);
          response.status(500).json({ error: 'Internal server error' });
          return;
        }
        
        response.status(200).json(result.rows);
      });
    } catch (error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const getSpeciesCountMonth = async (request, response) => {
    try {
      const species = request.params.species;
      
      const query = `
      SELECT gs.date,
       COALESCE(counts.sightings_count, 0) AS species_count
FROM (
  SELECT generate_series(
           CURRENT_DATE - INTERVAL '29 days',
           CURRENT_DATE,
           '1 day'
         ) AS date
) AS gs
LEFT JOIN (
  SELECT DATE_TRUNC('day', sightingtime) AS date,
         COUNT(*) AS sightings_count
  FROM posts
  WHERE title = $1
    AND sightingtime >= CURRENT_DATE - INTERVAL '29 days'
    AND sightingtime <= CURRENT_DATE
    AND verified = true
  GROUP BY DATE_TRUNC('day', sightingtime)
) AS counts ON gs.date = counts.date
ORDER BY gs.date ASC;

      `;
      
      const values = [species];
      
      db.clientPool.query(query, values, (error, result) => {
        if (error) {
          console.error('Error executing query:', error);
          response.status(500).json({ error: 'Internal server error' });
          return;
        }
        
        response.status(200).json(result.rows);
      });
    } catch (error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  


module.exports = {
    searchAll,
    searchSpeciesName,
    searchSpecies,
    searchClass,
    searchOrder,
    searchFamily,
    searchGenus,
    searchFamilyCatalogue,
    searchClassCatalogue,
    searchOrderCatalogue,
    searchGenusCatalogue,
    getSpeciesSightingsByHour,
    getSpeciesCountWeek,
    getSpeciesCountMonth
}