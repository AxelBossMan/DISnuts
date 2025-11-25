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

  async getInfoEvent(event_id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input('event_id', sql.Int, event_id)
      .query('SELECT * FROM dbo.events WHERE event_id = @event_id');
    return result.recordset;
  }

  async getRecipientsForEvent(event_id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("event_id", sql.Int, event_id)
      .query(`
        SELECT u.user_id, u.phone_number
        FROM dbo.event_users eu
        JOIN dbo.users u ON eu.user_id = u.user_id
        WHERE eu.event_id = @event_id
      `);
    return result.recordset;
  }
  // CREATE, for å legge til  sceduling messages i databasen
  async create(data, table) {
    const pool = await this.connect();

    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map(value => `'${String(value).replace(/'/g, "''")}'`)
      .join(", ");

    const result = await pool.request()
      .query(`INSERT INTO dbo.${table} (${columns}) VALUES (${values})`);

    return result;
  }

  // RAW SQL (tidligere "query")
  async query(sqlText) {
    const pool = await this.connect();
    const result = await pool.request().query(sqlText);
    return result.recordset;
  }

  // readOneEvent fra database.js
  async readOneEvent(id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("event_id", sql.Int, id)
      .query("SELECT * FROM dbo.event WHERE event_id = @event_id");

    return result.recordset[0];
  }
}

module.exports = new Database();
