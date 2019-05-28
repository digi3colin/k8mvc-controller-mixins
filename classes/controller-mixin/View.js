const K8 = require('k8mvc');
const View = K8.require('View');
const ControllerMixin = K8.require('ControllerMixin');

class ControllerMixinView extends ControllerMixin{
  async before(){
    this.view = this.getView(this.client.layout || 'layout/default', {});
  }

  async after(){
    if(!this.view)return;

    if(this.client.tpl){
      this.view.data.main = await this.client.tpl.render();
    }else{
      this.view.data.main = this.output;
    }

    this.client.output = await this.view.render();
  }

  getView(path, data, viewClass = null){
    if(viewClass)return new viewClass(path, data);
    return new View.defaultViewClass(path, data);
  }
}

module.exports = ControllerMixinView;