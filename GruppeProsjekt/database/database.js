const sql = require('mssql');

async function createDatabaseConnection(config) {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();

    await poolConnect; 

    return {
        // read all from a table
        readAll: async (table) => {
            const result = await pool.request()
                .query(`SELECT * FROM ${table}`);
            return result.recordset;
        },

        // create a new record in a table
        create: async (data, table) => {
            const columns = Object.keys(data).join(', ');
            const values = Object.values(data)
                .map(value => `'${value}'`)
                .join(', ');
            // Insert query including table name, columns, and values
            const result = await pool.request()
                .query(`INSERT INTO ${table} (${columns}) VALUES (${values})`);
            // result object consists of information about the query
            return result;
        }
    };
}

module.exports = { createDatabaseConnection };
