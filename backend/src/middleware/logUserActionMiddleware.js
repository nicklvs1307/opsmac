const logUserAction = (action) => {
  return (req, res, next) => {
    // Adicionar log da ação
    req.userAction = {
      action,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
    };
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[${req.userAction.timestamp.toISOString()}] ${action} - User: ${req.user?.userId || 'Anonymous'} - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  };
};

module.exports = { logUserAction };
