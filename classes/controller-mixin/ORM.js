const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');

class ControllerMixinORM extends ControllerMixin{
  async before(){
    this.client.id = (this.client.request.params.id) ? parseInt(this.client.request.params.id) : null;
  }

  action_index(){
    if(!this.client.model)return;

    const m = new this.client.model(null, this.client.db);
    this.client.instances = m.all();
  }

  action_read(){
    this.client.instance = new this.client.model(this.client.id, this.client.db);
  }
}

module.exports = ControllerMixinORM;