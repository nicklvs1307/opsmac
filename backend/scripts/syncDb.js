const { syncDatabase } = require('../config/database');
require('dotenv').config();

const runSync = async () => {
  console.log('Iniciando sincronização do banco de dados...');
  // Use force: true com cautela em produção, pois apaga dados existentes.
  // Para este caso, como a tabela não existe, force: false ou alter: true é seguro.
  const success = await syncDatabase(true); // force: true para recriar todas as tabelas
  if (success) {
    console.log('Sincronização do banco de dados concluída com sucesso.');
  } else {
    console.error('Falha na sincronização do banco de dados.');
  }
  process.exit();
};

runSync();
