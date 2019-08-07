const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');

class Mime extends ControllerMixin{
    before(client){
        const format = this.client.request.params.format || 'html';

        switch(format){
            case 'json':
                this.client.response.type('text/json; charset=utf-8');
                break;
            case 'png':
                this.client.response.type('image/png');
                break;
            case 'jpg':
            case 'jpeg':
                this.client.response.type('image/jpeg');
                break;
            default:
                this.client.response.type('text/html; charset=utf-8');
        }
    }
}

module.exports = Mime;