const compose = require('composable-middleware');
const response = require('../utils/response');
const messages = require('../utils/messages')['common'];


const hasAccess = moduleName => {
  if (moduleName === undefined)
    throw new Error('Required role needs to be set');

  return compose().use((req, res, next) => {
        if(req.user.role.modules.indexOf(moduleName) != -1){
          return next();
        }else{
          for(let accessGroup of req.user.accessGroups || []){
            if(accessGroup.modules.indexOf(moduleName)){
              return next();
            }
          }
        }
      return response.sendError(res, messages.unauthorized_module);
  });
};

module.exports = hasAccess;
