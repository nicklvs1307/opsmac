module.exports = (db) => {
  const getHealthStatus = () => {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  };

  return {
    getHealthStatus,
  };
};
