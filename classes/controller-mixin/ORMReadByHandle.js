const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const ORM = K8.require('ORM');

class ORMReadByHandle extends ControllerMixin{
  action_read_by_handle(){
    const model = this.client.model;
    const handle = this.client.request.params.handle;
    const sql = `SELECT * from ${model.tableName} WHERE handle = ?`;

    this.client.instance = Object.assign(new model(), ORM.prepare(sql).get(handle));
  }

  instanceNotFoundRedirect(instance, response, path){
    if(!instance || !instance.id || instance.length === 0){
      response.redirect(path);
    }
  }
}

module.exports = ORMReadByHandle;