const sql = require("mssql");
const config = require("./sqlconfig");

class Database {
  constructor() {
    this.pool = null;
  }

  // Connect once, reuse connection
  async connect() {
    if (!this.pool) {
      this.pool = await sql.connect(config);
    }
    return this.pool;
  }

  // ------------------------
  //       EVENT METHODS
  // ------------------------

  async getEvents() {
    const pool = await this.connect();
    const result = await pool.request().query(`
      SELECT *
      FROM Events
      ORDER BY eventDate ASC
    `);
    return result.recordset;
  }

  async getEventById(id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM Events
        WHERE id = @id
      `);
    return result.recordset[0] || null;
  }

  async createEvent(event) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("title", sql.VarChar, event.title)
      .input("location", sql.VarChar, event.location)
      .input("eventDate", sql.Date, event.eventDate)
      .query(`
        INSERT INTO Events (title, location, eventDate)
        VALUES (@title, @location, @eventDate)
      `);

    return result.rowsAffected[0] > 0;
  }

  async deleteEvent(id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM Events WHERE id = @id
      `);

    return result.rowsAffected[0] > 0;
  }

  // ------------------------
  //   GENERIC SQL HELPERS
  // ------------------------

  async readAll(table) {
    const pool = await this.connect();
    const result = await pool.request().query(`SELECT * FROM ${table}`);
    return result.recordset;
  }

  async raw(query) {
    const pool = await this.connect();
    const result = await pool.request().query(query);
    return result.recordset;
  }
}

module.exports = new Database();
