const { sequelize, models } = require('../src/config/database');

const updateAllCustomerSegments = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    const customers = await models.Customer.findAll();
    console.log(`Iniciando atualização de segmentação para ${customers.length} clientes.`);

    for (const customer of customers) {
      try {
        await customer.updateStats();
        console.log(`Segmentação atualizada para o cliente: ${customer.id} - ${customer.name}`);
      } catch (error) {
        console.error(`Erro ao atualizar segmentação para o cliente ${customer.id}:`, error);
      }
    }

    console.log('Atualização de segmentação de clientes concluída.');
  } catch (error) {
    console.error('Erro ao executar o script de atualização de segmentação:', error);
  } finally {
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

updateAllCustomerSegments();
