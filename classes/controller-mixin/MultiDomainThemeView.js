const K8 = require('k8mvc');
const View = K8.require('View');
const ControllerMixin = K8.require('ControllerMixin');

class MultiDomainThemeView extends ControllerMixin{
  getThemePath(){
    const hostname = this.client.request.hostname.split(':')[0];
    return K8.EXE_PATH.replace('/server', '/sites/')  + hostname + '/themes/default/';
  }

  async before(){
    this.themePath = this.themePath || this.getThemePath();
    this.client.view = this.getView(this.client.layout || 'layout/default', {domain : this.client.request.hostname});
    this.client.getView = (path, data, viewClass = null) => this.getView(path, data, viewClass);
  }

  async after(){
    if(this.client.output !== '')return;
    if(!this.client.view)return;

    if(this.client.tpl){
      this.client.view.data.content_for_layout = await this.client.tpl.render();
    }else{
      this.client.view.data.content_for_layout = this.client.output;
    }

    this.client.output = await this.client.view.render();
  }

  getView(path, data, viewClass = null){
    this.themePath = this.themePath || this.getThemePath();

    if(viewClass)return new viewClass(path, data, this.themePath);
    return new View.defaultViewClass(path, data, this.themePath);
  }
}

module.exports = MultiDomainThemeView;