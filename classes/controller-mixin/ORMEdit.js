const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const HelperForm = K8.require('helper/Form');

class ControllerMixinORMEdit extends ControllerMixin{

  action_edit(){
    const instance = this.client.instance;
    this.client.data = Object.assign(
        this.getFieldData(instance),
        this.getBelongsTo(instance),
        this.getBelongsToMany(instance),
        this.getHasMany(instance),
        this.getFormDestination(),
        this.getDomain()
    );
  }

  action_read(){
    this.action_edit()
  }

  action_create(){
    this.client.instance = new this.client.model(null, {database : this.client.db});
    const $_GET = this.client.request.query || {};

    if($_GET['values']){
      const values = JSON.parse($_GET['values']);

      Object.keys(this.client.instance).forEach(x => {
        if(values[x] !== undefined){
          this.client.instance[x] = values[x];
        }
      });
    }

    this.action_edit();
  }

  getFormDestination(){
    const $_GET = this.client.request.query || {};
    if($_GET['cp']){
      return {
        destination : $_GET['cp']
      }
    }
    return {};
  }

  getFieldData(instance){
    const m = instance.constructor;

    return {
      title     : `${(instance.id) ? 'Edit': 'Create'} ${m.name}`,
      model     : m,
      item      : instance,
      fields    : Object.keys(m.fieldType).map(x => HelperForm.getFieldValue('', x, m.fieldType[x], instance[x])),
    };
  }

  getBelongsTo(instance) {
    const m = instance.constructor;
    if (!m.belongsTo || m.belongsTo.length <= 0) return;

    return {
      belongsTo: m.belongsTo.map(x => {
        const model = K8.require(`models/${x.model}`);
        const mm = new model(null, {database : this.client.db});
        return {
          model: model,
          foreign_key: x.fk,
          value : instance[x.fk],
          items : mm.all()
        }
      })
    }
  }

  getBelongsToMany(instance){
    const m = instance.constructor;
    if(!m.belongsToMany || m.belongsToMany.length <= 0)return;

    return {
      belongsToMany: m.belongsToMany.map( x => {
            const model = K8.require(`models/${x}`);
            const lk = m.key;
            const fk = model.key;
            const table = `${m.jointTablePrefix}_${model.tableName}`;
            const mm = new model(null, {database : this.client.db});

            const items = mm.all();
            const itemsById = {};
            items.forEach(x => itemsById[x.id] = x);

            const values = mm
                .prepare(`SELECT * from ${table} WHERE ${lk} = ?`)
                .all(instance.id);

            values.forEach(x => {
              itemsById[x[fk]].linked = true;
              itemsById[x[fk]].weight = x.weight;
            }) ;

            return{
              model : model,
              values : values,
              items: items
            }
          }
      )}
  }

  getHasMany(instance){
    const m = instance.constructor;
    if(!m.hasMany || m.hasMany.length <=0 )return;

    //TODO, collapse different hasMany fk with same model
    //eg. shipping address and billing address with same address id.
    return {
      hasMany : m.hasMany.map( x => {
        const model = K8.require(`models/${x.model}`);
        const mm = new model(null, {database : this.client.db});

        const fk = x.fk;
        const table = `${model.tableName}`;

        const items = mm.prepare(`SELECT * from ${table} WHERE ${fk} = ?`)
            .all(this.client.id)
            .map(item => Object.assign(item, {
              fields: Object
                  .keys(model.fieldType)
                  .map(y => HelperForm.getFieldValue(`${model.name}(${item.id})`, y, model.fieldType[y], item[y] ||''))
            }));

        return {
          model : model,
          items : items,
          defaultValues: encodeURIComponent(`{"${fk}":${this.client.id}}`),
          checkpoint: encodeURIComponent(this.client.request.raw.url)
        }
      })
    }
  }

  getDomain(){
    return {
      domain : this.client.request.hostname
    }
  }
}

module.exports = ControllerMixinORMEdit;