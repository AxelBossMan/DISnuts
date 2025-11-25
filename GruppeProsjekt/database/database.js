const sql = require('mssql');

async function createDatabaseConnection(config) {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();

    await poolConnect; 

    return pool;
}

module.exports = { createDatabaseConnection };
