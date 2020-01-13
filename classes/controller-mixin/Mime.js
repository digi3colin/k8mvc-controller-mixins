const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');

class Mime extends ControllerMixin{
    before(){
        const matchExtension = (/\.[0-9a-z]+($|\?)/i).exec(this.client.request.raw.url || '');
        const extension = matchExtension ? matchExtension[0].replace(/[.?]/g, '') : 'html';
        this.client.fileExtension = extension;

        switch(extension){
            case 'js':
            case 'json':
                this.client.response.type('application/json; charset=utf-8');
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