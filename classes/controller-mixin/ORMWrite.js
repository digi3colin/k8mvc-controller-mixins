const K8 = require('k8mvc');
const ControllerMixinMultipartForm = K8.require('controller-mixin/MultipartForm');

class ControllerMixinORMWrite extends ControllerMixinMultipartForm{
  action_update(){
    const fieldsToUpdate = this.mappingFields();
    this.belongsFields(fieldsToUpdate);

    if(this.client.id){
      this.update(fieldsToUpdate);
    }else{
      this.create(fieldsToUpdate);
    }

    this.add();

    const children = this.getChildren();
    this.validateChildren(children);
    this.updateHasMany(children);
  }

  belongsFields(fieldsToUpdate){
    const $_POST  = this.client.$_POST;
    const belongs = this.client.model.belongsTo;
    if(!belongs || belongs.length <= 0)return;

    belongs.forEach(x => {
      const value = $_POST[`:${x.fk}`];
      if(value === undefined)return;
      if(value === '')return;
      if(Array.isArray(value))return;

      fieldsToUpdate[x.fk] = value;
    });
  }

  mappingFields(){
    const m = this.client.model;
    const $_POST = this.client.$_POST;

    const fieldsToUpdate = {};

    const fields = m.fieldType ? Object.keys(m.fieldType) : Object.keys(m);
    fields.forEach(x => {
      const value = $_POST[`:${x}`];
      if(value === undefined)return;
      if(Array.isArray(value))return;

      fieldsToUpdate[x] = value;
    });

    return fieldsToUpdate;
  }

  update(fieldsToUpdate){
    const m = this.client.model;
    const mm = new m(this.client.id, {database : this.client.db});
    Object.assign(mm, fieldsToUpdate);
    mm.save();
  }

  create(fieldsToUpdate){
    const m = this.client.model;
    const mm = new m(null, {database : this.client.db});
    Object.assign(mm, fieldsToUpdate);
    mm.save();
    this.client.id = mm.id;
  }

  add(){
    const m = this.client.model;
    if(!m.belongsToMany || m.belongsToMany.length <= 0)return;

    const mm = new m(null, {database : this.client.db});
    const $_POST = this.client.$_POST;

    m.belongsToMany.forEach(x => {
      const values = $_POST[':' + x.toLowerCase()];
      if(values === undefined)return;
      if(!Array.isArray(values))return;

      const filteredValues = values.filter(x => (x !== ""));

      const model = K8.require(`models/${x}`);
      const lk = m.key;
      const table = `${m.jointTablePrefix}_${model.tableName}`;

      //remove
      mm.prepare(`DELETE FROM ${table} WHERE ${lk} = ?`).run(this.client.id);
      if(filteredValues.length <= 0)return;

      //add
      mm.prepare(`INSERT INTO ${table} VALUES ${filteredValues.map((x, i) => `(${this.client.id}, ?, ${i})`).join(', ')}`).run(...filteredValues);

    });
  }

  getChildren(){
    const prefixes = {};
    Object.keys(this.client.$_POST).forEach(x => {
      if(/:/.test(x) === false)return;
      const prefix = x.split(':')[0];
      if(prefix ==='')return;
      prefixes[prefix] = true;
    });

    const children = {};
    Object.keys(prefixes).forEach(x => {
      const prefixSegs = x.split('(');
      const model = prefixSegs[0];
      if((model || prefixSegs[1]) === false)return;

      children[model] = children[model] || [];
      children[model].push(parseInt(prefixSegs[1]));
    });

    return children;
  }

  validateChildren(children){
    const manyModels = {};
    const m = this.client.model;
    m.hasMany.forEach(x => manyModels[x.model] = true);

    Object.keys(children).forEach(
        x => {
          if(manyModels[x] !== true){
            throw new Error(`Invalid POST data. ${m.name} not has many ${x}`);
          }
        }
    )
  }

  updateHasMany(validatedChildren){
    //group POST data by prefix
    const $_POST = this.client.$_POST || {};
    const values = {};
    Object.keys($_POST).forEach(name => {
      const nameSegment = name.split(':');
      const prefix = nameSegment[0];
      const field = nameSegment[1];
      if(!prefix || !field)return;

      values[prefix] = values[prefix] || {};
      values[prefix][field] = $_POST[name];
    });

    Object.keys(validatedChildren).forEach(x => {
      const model = K8.require(`models/${x}`);
      const m = new model(null, {database : this.client.db});

      validatedChildren[x].forEach(id => {
        const prefix = `${x}(${id})`;

        const fieldsToUpdate = {};

        Object.keys(values[prefix]).forEach(field =>{
          if(!model.fieldType[field])throw new Error(`Invalid Field. Model: ${model.name} not have field: ${field}`)

          const value = $_POST[`${prefix}:${field}`];
          if(Array.isArray(value))throw new Error(`field: ${field} value should not be array`);

          fieldsToUpdate[field] = value;
        });

        const sql = `UPDATE ${model.tableName} SET ${Object.keys(fieldsToUpdate).map(x => `${x} = ?`).join(', ')} WHERE id = ?`;
        const childValues = Object.keys(fieldsToUpdate).map(x => fieldsToUpdate[x]);

        m.prepare(sql).run(...childValues, id);
      });
    });
  }
}

module.exports = ControllerMixinORMWrite;