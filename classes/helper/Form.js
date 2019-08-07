const fs = require('fs');
const K8 = require('k8mvc');
const uniqid = require('uniqid');

class HelperForm{
  static parseMultipartForm(request, $_POST){
    return new Promise((resolve, reject) =>{

      const mp = request.multipart(
          (field, file, filename, encoding, mimetype) => {},
          (err) => {if(err)reject(err);});

      mp.on('field', (key, value) => {
        if(/\[]$/.test(key)){
          const k = key.replace('[]', '');
          $_POST[k] = $_POST[k] || [];
          $_POST[k].push(value);
        }else{
          $_POST[key] = value;
        }
      });

      mp.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const path = `${K8.EXE_PATH}/tmp/${uniqid()}`;
        file.pipe(fs.createWriteStream(path));

        file.on('data', data => {});

        file.on('end', ()=> {
          $_POST[fieldname] = {
            tmp: path,
            filename: filename,
            encoding: encoding,
            mimetype: mimetype
          };
        });
      });

      mp.on('finish', () => { resolve(); });
    });
  }

  static getFieldValue(scope, fieldName, fieldType = [], value = null){
    return {
      label : fieldName,
      name  : `${scope}:${fieldName}`,
      type  : fieldType[0],
      required : (fieldType[1] === 'NOT NULL'),
      defaultValue : fieldType[2] || '',
      value : value
    }
  }
}

module.exports = HelperForm;