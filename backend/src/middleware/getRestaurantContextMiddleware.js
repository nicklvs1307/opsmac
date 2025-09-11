module.exports = () => {
  return (req, res, next) => {
    req.context = req.context || {};
    next();
  };
};