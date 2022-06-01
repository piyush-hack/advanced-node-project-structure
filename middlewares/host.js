const host = async (req, res, next) => {          
    req.hostUrl = (process.env.PROTOCOL || "http") + '://' + req.get('host');
    next();
};
  
  
module.exports = host;