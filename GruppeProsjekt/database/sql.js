const sql = require("mssql");
const config = require("./sqlconfig");

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    if (!this.pool) {
      this.pool = await sql.connect(config);
    }
    return this.pool;
  }

  async readAll(table) {
    const pool = await this.connect();
    const result = await pool.request().query(`SELECT * FROM dbo.${table}`);
    return result.recordset;
  }

  async raw(query) {
    const pool = await this.connect();
    const result = await pool.request().query(query);
    return result.recordset;
  }
}

module.exports = new Database();
