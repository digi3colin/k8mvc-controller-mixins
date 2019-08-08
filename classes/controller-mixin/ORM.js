const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const ORM = K8.require('ORM');

class ControllerMixinORM extends ControllerMixin{
  async before(){
    this.client.id = (this.client.request.params.id) ? parseInt(this.client.request.params.id) : null;
  }

  action_index(){
    if(!this.client.model || !this.client.model.tableName){
      return;
    }
    this.client.instances = ORM.all(this.client.model);
  }

  action_read(){
    this.client.instance = ORM.get(this.client.model, this.client.id);
  }
}

module.exports = ControllerMixinORM;