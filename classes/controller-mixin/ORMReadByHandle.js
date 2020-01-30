const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');

class ORMReadByHandle extends ControllerMixin{
  async action_read_by_handle(){
    if(!this.client.model)return;

    const model = this.client.model;
    const handle = this.client.request.params.handle;

    const mm = new model(null, {database: this.client.db} );
    const instance = Object.assign(mm, mm.prepare(`SELECT * from ${model.tableName} WHERE handle = ?`).get(handle));
    if(!instance.id)this.client.notFound(`${model.tableName} handle "${handle}" not found`);

    this.client.instance = instance;

    const prefix = this.client.templatePrefix || this.client.model.jointTablePrefix;
    const suffix = instance.template_suffix || '';
    const template = prefix + (suffix !== '' ? ('.' + suffix) : '');

    this.client.templates.read = 'templates/' + template;
    this.client.view.data.template = template;
  }
}

module.exports = ORMReadByHandle;