const logUserAction = (action) => {
  return (req, res, next) => {
    // Adicionar log da ação
    req.userAction = {
      action,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      body:
        req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    };

    next();
  };
};

module.exports = { logUserAction };
