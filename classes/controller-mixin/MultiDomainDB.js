const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const Database = require('better-sqlite3');

const DB = {pool : []};

const guardRegisterd = (hostname, reply) =>{
  //guard site registered.
  if(!fs.existsSync(`${K8.EXE_PATH}/../sites/${hostname}`)){
    reply.code(404);
    return true;
  }
  return false;
};

const getConnection = (hostname) =>{
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
};

class MultiDomainDB extends ControllerMixin{
  async before(){
    const hostname = request.hostname.split(':')[0];

    if(guardRegisterd(hostname, reply))return `404 / store not registered`;

    //setup ORM
    const ORM      = K8.require('ORM');
    ORM.setDB(getConnection(hostname));
  }
}

module.exports = MultiDomainDB;