const K8 = require('k8mvc');
const fs = require('fs');
const Database = require('better-sqlite3');

const ControllerMixin = K8.require('ControllerMixin');
const DB = {pool : []};

class MultiDomainDB extends ControllerMixin{
  async before(){
    const hostname = this.client.request.hostname.split(':')[0];

    //guard hostname not registered.
    if(!fs.existsSync(`${K8.EXE_PATH}/../sites/${hostname}`)){
      this.client.notFound(`404 / store ${hostname} not registered`);
      return;
    }

    this.client.db = MultiDomainDB.getConnection(hostname);
  }

  static getConnection(hostname){
    if(!K8.config.cache.database || !DB.pool[hostname]){
      const dbPath = `${K8.APP_PATH}/../../sites/${hostname}/db/db.sqlite`;
      const db = new Database(dbPath);
//      db.pragma('journal_mode = WAL');

      DB.pool[hostname] = {
        connection : db,
        access_at : Date.now()
      };
    }

    DB.pool[hostname].access_at = Date.now();
    return DB.pool[hostname].connection;
  }
}

module.exports = MultiDomainDB;