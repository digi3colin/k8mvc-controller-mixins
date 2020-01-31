const K8 = require('k8mvc');
const fs = require('fs');
const Database = require('better-sqlite3');

const ControllerMixin = K8.require('ControllerMixin');
const DB = {pool : []};

class MultiDomainDB extends ControllerMixin{
  async before(){
    const request = this.client.request;
    const host = request.hostname || 'localhost';
    const hostname = host.split(':')[0];

    //guard hostname not registered.
    if(!fs.existsSync(`${K8.EXE_PATH}/../sites/${hostname}`)){
      this.client.notFound(`404 / store ${hostname} not registered`);
      return;
    }

    const conn = MultiDomainDB.getConnections(hostname);
    this.client.db = conn.content;
    this.client.dbTransaction = conn.transaction;
    this.client.dbInventory = conn.inventory;
  }

  static getConnections(hostname){
    if(!K8.config.cache.database || !DB.pool[hostname]){
      const dbPath = `${K8.APP_PATH}/../../sites/${hostname}/db/`;

      DB.pool[hostname] = {
        content     : new Database(dbPath + 'content.sqlite'),
        transaction : new Database(dbPath + 'transaction.sqlite'),
        inventory   : new Database(dbPath + 'inventory.sqlite'),
        access_at : Date.now()
      };
    }

    const connection = DB.pool[hostname];
    connection.access_at = Date.now();
    return connection;
  }
}

module.exports = MultiDomainDB;