const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.userId || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar requests antigos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }
    
    // Verificar limite
    const userRequests = requests.get(userId) || [];
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente mais tarde',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Adicionar requisição atual
    userRequests.push(now);
    requests.set(userId, userRequests);
    
    next();
  };
};

module.exports = { userRateLimit };
