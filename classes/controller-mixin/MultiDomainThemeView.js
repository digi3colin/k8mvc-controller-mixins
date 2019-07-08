const K8 = require('k8mvc');
const View = K8.require('View');
const ControllerMixinView = K8.require('controller-mixin/View');

class MultiDomainThemeView extends ControllerMixinView{
  async before(){
    const hostname = this.client.request.hostname.split(':')[0];
    this.themePath = K8.EXE_PATH.replace('/server', '/sites/')  + hostname + '/themes/default/';

    this.client.view = this.getView(this.client.layout || 'layout/default', {domain : this.client.request.hostname});
  }

  async after(){
    if(!this.client.view)return;

    if(this.client.tpl){
      this.client.view.data.content_for_layout = await this.client.tpl.render();
    }else{
      this.client.view.data.content_for_layout = this.client.output;
    }

    this.client.output = await this.client.view.render();
  }

  getView(path, data, viewClass = null){
    if(viewClass)return new viewClass(path, data, this.themePath);
    return new View.defaultViewClass(path, data, this.themePath);
  }
}

module.exports = MultiDomainThemeView;