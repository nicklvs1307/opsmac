const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Check Test API',
      version: '1.0.0',
      description: 'API documentation for the Check Test application.',
    },
    servers: [
      {
        url: `https://feedelizaapi.towersfy.com/api`,
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Public API',
        description: 'Endpoints acessíveis via API Token para integração externa.',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key para autenticação de requisições públicas.',
        },
      },
      schemas: {
        Checkin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customer_id: { type: 'string', format: 'uuid' },
            restaurant_id: { type: 'string', format: 'uuid' },
            checkin_time: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'] },
          },
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customer_id: { type: 'string', format: 'uuid' },
            restaurant_id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            nps_score: { type: 'integer', minimum: 0, maximum: 10 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            restaurant_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID do usuário' },
            name: { type: 'string', description: 'Nome do usuário' },
            email: { type: 'string', format: 'email', description: 'Email do usuário' },
            phone: { type: 'string', description: 'Telefone do usuário' },
            role: { type: 'string', enum: ['owner', 'admin', 'employee'], description: 'Papel do usuário no sistema' },
            is_active: { type: 'boolean', description: 'Indica se a conta do usuário está ativa' },
            last_login: { type: 'string', format: 'date-time', description: 'Data e hora do último login' },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação do usuário' },
            updated_at: { type: 'string', format: 'date-time', description: 'Data da última atualização do usuário' },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'ID do restaurante' },
            name: { type: 'string', description: 'Nome do restaurante' },
            address: { type: 'string', description: 'Endereço do restaurante' },
            city: { type: 'string', description: 'Cidade do restaurante' },
            state: { type: 'string', description: 'Estado do restaurante' },
            zip_code: { type: 'string', description: 'CEP do restaurante' },
            phone: { type: 'string', description: 'Telefone do restaurante' },
            email: { type: 'string', format: 'email', description: 'Email do restaurante' },
            website: { type: 'string', format: 'url', description: 'Website do restaurante' },
            owner_id: { type: 'string', format: 'uuid', description: 'ID do proprietário do restaurante' },
            is_active: { type: 'boolean', description: 'Indica se o restaurante está ativo' },
            created_at: { type: 'string', format: 'date-time', description: 'Data de criação do restaurante' },
            updated_at: { type: 'string', format: 'date-time', description: 'Data da última atualização do restaurante' },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
  ], // Path to the API docs
};

const specs = swaggerJsdoc(options);
console.log('Swagger JSDoc options.apis:', options.apis);
console.log('Generated Swagger Specs (first 500 chars):', JSON.stringify(specs, null, 2).substring(0, 500));

module.exports = specs;