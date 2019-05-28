const K8 = require('k8mvc');
const ControllerMixin = K8.require('ControllerMixin');
const HelperForm = K8.require('helper/Form');
const ORM = K8.require('ORM');

class ControllerMixinORMEdit extends ControllerMixin{
  action_edit(instance){
    return Object.assign(
      this.getFieldData(instance),
      this.getBelongsTo(instance),
      this.getBelongsToMany(instance),
      this.getHasMany(instance),
      this.getFormDestination()
    );
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
        const model = K8.require(`model/${x.model}`);
        return {
          model: model,
          foreign_key: x.fk,
          value : instance[x.fk],
          items : ORM.all(model)
        }
      })
    }
  }

  getBelongsToMany(instance){
    const m = instance.constructor;
    if(!m.belongsToMany || m.belongsToMany.length <= 0)return;

    return {
      belongsToMany: m.belongsToMany.map( x => {
        const model = K8.require(`model/${x}`);
        const lk = m.key;
        const fk = model.key;
        const table = `${m.lowercase}_${model.tableName}`;

        return{
          model : model,
          value : ORM
            .prepare(`SELECT ${fk} from ${table} WHERE ${lk} = ?`)
            .all(instance.id),
          items: ORM.all(model)
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
        const model = K8.require(`model/${x.model}`);

        const fk = x.fk;
        const table = `${model.tableName}`;

        const items = ORM.prepare(`SELECT * from ${table} WHERE ${fk} = ?`)
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
}

module.exports = ControllerMixinORMEdit;