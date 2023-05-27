const { MongoClient } = require('mongodb');

const {
  DB_HOST = 'localhost',
  DB_PORT = '27017',
  DB_DATABASE = 'files_manager',
} = process.env;

const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
