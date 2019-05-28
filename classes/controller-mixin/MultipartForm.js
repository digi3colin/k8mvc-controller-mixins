const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const HelperForm         = K8.require('helper/Form');

class MultipartForm extends ControllerMixin{
  constructor(client){
    super(client);
    this.client.$_POST = this.client.request.body || {};
  }

  async before(){
    if(/multipart\/form-data/.test(this.client.request.headers['content-type'])){
      await HelperForm.parseMultipartForm(this.client.request, this.client.$_POST);
    }
  }
}

module.exports = MultipartForm;