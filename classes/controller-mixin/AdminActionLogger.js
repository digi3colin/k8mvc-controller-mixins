const K8 = require('k8mvc');
const ControllerMixer = K8.require('ControllerMixin');
const fs = require('fs');
const Auth = K8.require('Auth');

class AdminActionLogger extends ControllerMixer{
    async before(){
        const action = this.client.request.params.action;
        if(action === 'update' || action === 'edit' || action === 'delete' ){
            const now = new Date();
            const YYYY  = now.getFullYear();
            const MONTH = String(now.getMonth() + 1).padStart(2, '0');
            const DATE  = String( now.getDate() ).padStart(2, '0');
            const HH    = String( now.getHours() ).padStart(2,'0');
            const MM    = String( now.getMinutes() ).padStart(2,'0');
            const SS    = String( now.getSeconds() ).padStart(2, '0');

            const logDir = `${K8.APP_PATH}/logs/${YYYY}/${MONTH}/`;
            const file   = `${logDir}/${DATE}.admin.log`;

            //create folder if not exist
            if(!fs.existsSync(logDir)){
                fs.mkdirSync(logDir, { recursive: true }, err => {if (err) throw err;});
            }


            const session    = this.client.request.session || {};
            const user       = session.admin_logged_in ? session.user_id : 'not logged in';
            const request    = this.client.request;

            const data = {
                time       : `${HH}:${MM}:${SS}`,
                user       : user,
                params     : request.params,
                ip         : request.ip,
                ips        : request.ips,
            };

            fs.appendFile(file, `${JSON.stringify(data)}\n` , err => {if (err) throw err;});
        }
    }

    async execute(action){
        this.client.response.header('X-ZOPS-Controller-Action', `${ this.client.constructor.name }::${action}`);
    }
}

module.exports  = AdminActionLogger;