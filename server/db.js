const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`,
};

// Function to get a database connection
const getConnection = async () => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to Oracle Database');

    const result = await connection.execute('SELECT * FROM Users')
    console.log('result: ' + result);
    
    return connection;
  } catch (err) {
    console.error('Error connecting to Oracle Database:', err);
    throw err;
  }
};


module.exports = { getConnection };
