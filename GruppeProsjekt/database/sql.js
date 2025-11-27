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
      .query('SELECT * FROM dbo.event WHERE event_id = @event_id');
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
      .map(value => `N'${String(value).replace(/'/g, "''")}'`) // denne håndterer apostrofer og emojiier i SQL
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
  async readOneEventByCode(code) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("event_code", sql.VarChar, code)
      .query("SELECT * FROM dbo.event WHERE event_code = @event_code");
    console.log("readOneEventByCode result:", result);
    return result.recordset[0];
  }
  async readOneEvent(event_id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("event_id", sql.Int, event_id)
      .query("SELECT * FROM dbo.event WHERE event_id = @event_id");

    return result.recordset[0];
  }

  async getCompanyById(company_id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("company_id", sql.Int, company_id)
      .query(`
        SELECT company_id, company_name
        FROM dbo.company
        WHERE company_id = @company_id
      `);
  
    return result.recordset[0] || null;}
  async getIdFromMail(email) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT company_id FROM dbo.company WHERE email = @email");
    // console.log("GETIDFROMMAIL", result);
    return result.recordset[0] ? result.recordset[0].company_id : null;
  }
  
  //keywords tabellen min har "event_id" og "word" =keyword og "answer_text"= svar
  //keword inser er keyword {word: answer}
  async createKeywordLog(keywords, event_id, table) {
    const pool = await this.connect();
    for (const [word, answer_text] of Object.entries(keywords)) {
      await pool.request()
        .input("event_id", sql.Int, event_id)
        .input("word", sql.VarChar, word)
        .input("answer_text", sql.VarChar, answer_text)
        .query(`
          INSERT INTO dbo.${table} (event_id, word, answer_text)
          VALUES (@event_id, @word, @answer_text)
        `);
    }
    console.log("Keywords logged to database.");
  }
  async getKeywordsForEventID(event_id) {
    const pool = await this.connect();
    const result = await pool.request()
      .input("event_id", sql.Int, event_id)
      .query(`
        SELECT word, answer_text
        FROM dbo.keyword
        WHERE event_id = @event_id
      `);
    
    const keywords = {};
    result.recordset.forEach(row => {
      keywords[row.word] = row.answer_text;
    });
    console.log("Fetched keywords for event_id", event_id, ":", keywords);
    return keywords;
  }
  async getAllEventCodes() {
    const pool = await this.connect();
    const result = await pool.request()
      .query("SELECT event_code FROM dbo.event");
    
    return result.recordset.map(row => row.event_code);
  }
}

module.exports = new Database;
