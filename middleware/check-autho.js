
module.exports = (req, res, next) =>{
    if (req.method === 'OPTIONS') {
        return next();
    }
};