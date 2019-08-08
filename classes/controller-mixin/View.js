const K8 = require('k8mvc');
const View = K8.require('View');
const ControllerMixin = K8.require('ControllerMixin');

class ControllerMixinView extends ControllerMixin{
  async before(){
    this.client.view = this.getView(this.client.layout || 'layout/default', {});
    this.client.getView = this.getView;
  }

  async after(){
    const layout = this.client.view;
    if(!layout)return;

    if(this.client.tpl){
      layout.data.main = await this.client.tpl.render();
    }else{
      layout.data.main = this.client.output;
    }

    this.client.output = await layout.render();
  }

  getView(path, data, viewClass = null){
    if(viewClass)return new viewClass(path, data);
    return new View.defaultViewClass(path, data);
  }
}

module.exports = ControllerMixinView;