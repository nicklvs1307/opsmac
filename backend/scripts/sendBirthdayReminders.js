const { models, sequelize } = require('../config/database');
const { sendWhatsAppMessage } = require('../../src/services/integrations/whatsappApiClient');
const { Op } = require('sequelize');

async function sendBirthdayReminders() {
  console.log('Iniciando envio de lembretes de aniversário...');

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Mês é 0-indexado
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    // Buscar clientes que fazem aniversário hoje e que ainda não receberam mensagem este ano
    const customersCelebratingBirthday = await models.Customer.findAll({
      where: {
        birth_date: {
          [Op.ne]: null // Garante que a data de nascimento não é nula
        },
        [Op.and]: sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM birth_date')), currentMonth),
        [Op.and]: sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('DAY FROM birth_date')), currentDay),
        [Op.or]: [
          { last_birthday_message_year: { [Op.ne]: currentYear } },
          { last_birthday_message_year: null }
        ]
      },
      include: [
        {
          model: models.Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'whatsapp_api_url', 'whatsapp_api_key', 'whatsapp_instance_id', 'whatsapp_phone_number']
        }
      ]
    });

    if (customersCelebratingBirthday.length === 0) {
      console.log('Nenhum cliente fazendo aniversário hoje ou já recebeu a mensagem este ano.');
      return;
    }

    console.log(`Encontrados ${customersCelebratingBirthday.length} clientes para enviar lembrete de aniversário.`);

    for (const customer of customersCelebratingBirthday) {
      try {
        const restaurant = customer.restaurant;

        if (!customer.phone) {
          console.warn(`Cliente ${customer.id} (${customer.name}) não possui número de telefone. Pulando.`);
          continue;
        }

        if (!restaurant || !restaurant.whatsapp_api_url || !restaurant.whatsapp_api_key || !restaurant.whatsapp_instance_id || !restaurant.whatsapp_phone_number) {
          console.warn(`Cliente ${customer.id} (${customer.name}): Credenciais da Evolution API incompletas para o restaurante ${restaurant?.id}. Pulando.`);
          continue;
        }

        const birthdayGreetingEnabled = restaurant.settings?.whatsapp_messages?.birthday_greeting_enabled;
        const customBirthdayGreetingMessage = restaurant.settings?.whatsapp_messages?.birthday_greeting_text;

        if (birthdayGreetingEnabled) {
          // Gerar um cupom de cortesia de aniversário (exemplo: 10% de desconto)
          let birthdayCouponCode = null;
          let couponMessagePart = '';
          try {
            // Supondo que você tenha uma recompensa padrão para aniversário ou crie uma dinamicamente
            // Para este exemplo, vamos criar um cupom genérico ou buscar um existente
            const birthdayReward = await models.Reward.findOne({
              where: { restaurant_id: restaurant.id, title: 'Aniversário' } // Ou crie um se não existir
            });

            if (birthdayReward) {
              const newCoupon = await models.Coupon.create({
                reward_id: birthdayReward.id,
                customer_id: customer.id,
                restaurant_id: restaurant.id,
                code: `ANIVER${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                expires_at: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()) // Válido por 1 ano
              });
              birthdayCouponCode = newCoupon.code;
              couponMessagePart = `\n\nPara comemorar, use seu cupom de presente: *{{coupon_code}}*! 🎉`;
            } else {
              console.warn(`Restaurante ${restaurant.name} não possui recompensa de aniversário configurada.`);
            }
          } catch (couponError) {
            console.error(`Erro ao gerar cupom de aniversário para ${customer.name}:`, couponError);
            couponMessagePart = '\n\nFique de olho em nossas promoções especiais para você! 🎉';
          }

          let messageText = customBirthdayGreetingMessage || `Feliz Aniversário, {{customer_name}}! 🎂\n\nNós do *{{restaurant_name}}* desejamos um dia maravilhoso e cheio de alegria!${couponMessagePart}\n\nEsperamos celebrar com você! 😉`;

          // Substituir variáveis
          messageText = messageText.replace(/\{\{customer_name\}\}|/g, customer.name || '');
          messageText = messageText.replace(/\{\{restaurant_name\}\}|/g, restaurant.name || '');
          if (birthdayCouponCode) {
            messageText = messageText.replace(/\{\{coupon_code\}\}|/g, birthdayCouponCode);
          }

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsapp_api_url,
            restaurant.whatsapp_api_key,
            restaurant.whatsapp_instance_id,
            customer.phone,
            messageText
          );

          if (whatsappResponse.success) {
            console.log(`Mensagem de aniversário enviada com sucesso para ${customer.name} (${customer.phone})`);
            await customer.update({
              last_birthday_message_year: currentYear
            });
            // Opcional: Registrar o envio da mensagem no banco de dados
            await models.WhatsAppMessage.create({
              phone_number: customer.phone,
              message_text: messageText,
              message_type: 'birthday_greeting',
              status: 'sent',
              whatsapp_message_id: whatsappResponse.data?.id || null,
              restaurant_id: restaurant.id,
              customer_id: customer.id,
              coupon_id: birthdayCouponCode ? (await models.Coupon.findOne({ where: { code: birthdayCouponCode } }))?.id : null
            });
          } else {
            console.error(`Erro ao enviar mensagem de aniversário para ${customer.name} (${customer.phone}):`, whatsappResponse.error);
          }

          // Pequeno delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Erro ao processar cliente ${customer.id} (${customer.name}):`, error);
      }
    }

    console.log('Envio de lembretes de aniversário concluído.');

  } catch (error) {
    console.error('Erro geral no envio de lembretes de aniversário:', error);
  } finally {
    // Fechar a conexão com o banco de dados se este script for executado de forma independente
    // await sequelize.close();
  }
}

// Para execução via linha de comando
if (require.main === module) {
  sendBirthdayReminders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro fatal no script de lembretes de aniversário:', err);
      process.exit(1);
    });
}

module.exports = sendBirthdayReminders;