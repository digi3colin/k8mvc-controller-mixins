const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const ORM = K8.require('ORM');

class ControllerMixinORM extends ControllerMixin{
  async before(){
    this.client.id = (this.client.request.params.id) ? parseInt(this.client.request.params.id) : null;
  }

  async execute(action){
    switch(action){
      case 'action_index':
        this.client.instances = ORM.all(this.client.model);
        break;
      case 'action_read':
        this.client.instance = ORM.get(this.client.model, this.client.id);
    }
  }
}

module.exports = ControllerMixinORM;