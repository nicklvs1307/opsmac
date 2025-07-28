const { sequelize, models } = require('../config/database');
require('dotenv').config();

const createAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'; // Altere esta senha para uma forte!
  const adminName = 'Super Admin';

  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    // Sincroniza o modelo User com o banco de dados (garante que a tabela exista)
    await models.User.sync({ alter: true }); 

    const existingAdmin = await models.User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Usuário admin com email ${adminEmail} já existe.`);
      // Opcional: Atualizar a senha se o usuário já existir e você quiser resetar
      // existingAdmin.password = adminPassword;
      // await existingAdmin.save();
      // console.log('Senha do admin atualizada.');
    } else {
      const newAdmin = await models.User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        is_active: true,
        email_verified: true
      });
      console.log(`Usuário admin ${newAdmin.name} criado com sucesso!`);
      console.log(`Email: ${newAdmin.email}`);
      console.log(`Role: ${newAdmin.role}`);
      console.log('Lembre-se de alterar a senha padrão se você não a definiu via variáveis de ambiente.');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

createAdminUser();
