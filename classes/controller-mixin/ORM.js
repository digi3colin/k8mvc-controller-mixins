const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const ORM = K8.require('ORM');

class ControllerMixinORM extends ControllerMixin{
  constructor(client){
    super(client);
    this.client.id = (this.client.request.params.id) ? parseInt(this.client.request.params.id) : null;
  }

  action_index(){
    return ORM.all(this.client.model);
  }

  action_read(){
    return ORM.get(this.client.model, this.client.id);
  }
}

module.exports = ControllerMixinORM;