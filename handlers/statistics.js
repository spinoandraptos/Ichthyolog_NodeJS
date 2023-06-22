const db = require('../database')
const dotenv = require('dotenv')

dotenv.config()

const searchSpecies = async (request, response) => {
    try {
        const { species, startTime, endTime, sightingLocation } = request.query;

        let query = `
        SELECT COUNT(*) AS count, MAX(sightingtime) AS latest_sightingtime,
          (SELECT sightinglocation FROM posts
           WHERE title = $1 AND verified = true
             AND sightingtime >= $2 AND sightingtime <= $3
        `;
  
        const values = [species, startTime, endTime];
  
        if (sightingLocation !== '') {
            query += ' AND sightinglocation = $4';
            values.push(sightingLocation);
        }
  
        query += `
           ORDER BY sightingtime DESC
           LIMIT 1) AS latest_sightinglocation
        FROM posts
        WHERE title = $1 AND verified = true
        AND sightingtime >= $2 AND sightingtime <= $3
        `;

        db.dbConnect().query(query, values, (error, result) => {
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
    } catch(error) {
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
                response.send(error.message);
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch(error) {
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
        WHERE _order = $1
          AND verified = true
        ORDER BY title ASC
      `;

        const values = [order];

        db.dbConnect().query(query, values, (error, result) => {
            if (error) {
                response.send(error.message);
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch(error) {
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
                response.send(error.message);
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch(error) {
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
                response.send(error.message);
            }

            if (result.rowCount > 0) {
                response.status(200).json(result.rows);
            } else {
                response.status(404).send('No entries found');
            }
        });
    } catch(error) {
        console.error('Error executing query:', error);
        response.status(500).json({ error: 'Internal server error' });
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
      `;
  
      db.dbConnect().query(query, (error, result) => {
        if (error) {
          response.send(error.message);
        }
  
        response.status(200).json(result.rows);
      });
    } catch(error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };

  const searchClassCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT class, COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY class
        ORDER BY class ASC
      `;
  
      db.dbConnect().query(query, (error, result) => {
        if (error) {
          response.send(error.message);
        }
  
        response.status(200).json(result.rows);
      });
    } catch(error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const searchOrderCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT "_order", COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY "_order"
        ORDER BY "_order" ASC
      `;
  
      db.dbConnect().query(query, (error, result) => {
        if (error) {
          response.send(error.message);
        }
  
        response.status(200).json(result.rows);
      });
    } catch(error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };

  const searchGenusCatalogue = async (request, response) => {
    try {
      const query = `
        SELECT genus, COUNT(DISTINCT title) AS species_count
        FROM posts
        WHERE verified = true
        GROUP BY genus
        ORDER BY genus ASC
      `;
  
      db.dbConnect().query(query, (error, result) => {
        if (error) {
          response.send(error.message);
        }
  
        response.status(200).json(result.rows);
      });
    } catch(error) {
      console.error('Error executing query:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };
  



module.exports = {
    searchSpecies,
    searchClass,
    searchOrder,
    searchFamily,
    searchGenus,
    searchFamilyCatalogue,
    searchClassCatalogue,
    searchOrderCatalogue,
    searchGenusCatalogue
}