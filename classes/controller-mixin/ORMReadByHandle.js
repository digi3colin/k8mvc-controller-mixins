const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');

class ORMReadByHandle extends ControllerMixin{
  action_read_by_handle(){
    if(!this.client.model)return;

    const model = this.client.model;
    const handle = this.client.request.params.handle;

    const mm = new model(null, {database: this.client.db} );
    this.client.instance = Object.assign(mm, mm.prepare(`SELECT * from ${model.tableName} WHERE handle = ?`).get(handle));
    if(!this.client.instance.id)this.client.notFound(`${model.tableName} not found`);
  }
}

module.exports = ORMReadByHandle;