class HelperForm{
  static parseMultipartForm(request, $_POST){
    return new Promise((resolve, reject) =>{

      const handle = (field, file, filename, encoding, mimetype) =>{
        //TODO: handle form upload
        console.log(field, file, filename, encoding, mimetype);
      };

      const mp = request.multipart(handle, err =>{
        if(err)reject(err);
        resolve();
      });

      mp.on('field', (key, value) =>{
        if(/\[]$/.test(key)){
          const k = key.replace('[]', '');
          $_POST[k] = $_POST[k] || [];
          $_POST[k].push(value);
        }else{
          $_POST[key] = value;
        }
      })
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