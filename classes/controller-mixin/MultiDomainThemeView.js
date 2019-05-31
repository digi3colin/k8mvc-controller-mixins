const K8 = require('k8mvc');
const View = K8.require('View');
const ControllerMixinView = K8.require('controller-mixin/View');

class MultiDomainThemeView extends ControllerMixinView{
  async before(){
    const hostname = this.client.request.hostname.split(':')[0];
    this.themePath = K8.EXE_PATH + '/../sites/' + hostname + '/themes/default/';
    this.view = this.getView(this.client.layout || 'layout/default', {});
  }

  getView(path, data, viewClass = null){
    if(viewClass)return new viewClass(path, data, this.themePath);
    return new View.defaultViewClass(path, data, this.themePath);
  }
}

module.exports = MultiDomainThemeView;