const { models, sequelize } = require('../config/database');
const { sendWhatsAppMessage } = require('../../src/services/integrations/whatsappApiClient');

async function sendCouponReminders() {
  console.log('Iniciando envio de lembretes de cupons...');

  try {
    // Buscar cupons que expiram em breve e ainda não tiveram lembrete enviado
    const couponsToExpire = await models.Coupon.getExpiringSoon(3); // Cupons que expiram em 3 dias

    if (couponsToExpire.length === 0) {
      console.log('Nenhum cupom para enviar lembrete.');
      return;
    }

    console.log(`Encontrados ${couponsToExpire.length} cupons para lembrete.`);

    for (const coupon of couponsToExpire) {
      try {
        const customer = coupon.customer;
        const restaurant = coupon.restaurant;

        if (!customer || !restaurant) {
          console.warn(`Cupom ${coupon.id}: Cliente ou Restaurante não encontrado. Pulando.`);
          continue;
        }

        if (!customer.phone) {
          console.warn(`Cupom ${coupon.id}: Cliente ${customer.id} não possui número de telefone. Pulando.`);
          continue;
        }

        if (!restaurant.whatsapp_api_url || !restaurant.whatsapp_api_key || !restaurant.whatsapp_instance_id || !restaurant.whatsapp_phone_number) {
          console.warn(`Cupom ${coupon.id}: Credenciais da Evolution API incompletas para o restaurante ${restaurant.id}. Pulando.`);
          continue;
        }

        const couponReminderEnabled = restaurant.settings?.whatsapp_messages?.coupon_reminder_enabled;
        const customCouponReminderMessage = restaurant.settings?.whatsapp_messages?.coupon_reminder_text;

        if (couponReminderEnabled) {
          const reward = await models.Reward.findByPk(coupon.reward_id);
          const rewardTitle = reward ? reward.title : 'seu benefício';

          let messageText = customCouponReminderMessage || `Olá {{customer_name}}! 👋\n\nLembrete: Você tem um cupom ativo de *{{reward_title}}* ({{coupon_code}}) no *{{restaurant_name}}* que expira em breve!\n\nNão perca essa chance! Resgate seu cupom antes de {{expires_at}}.\n\nEsperamos por você! 😉`;

          // Substituir variáveis
          messageText = messageText.replace(/\{\{customer_name\}\} /g, customer.name || '');
          messageText = messageText.replace(/\{\{reward_title\}\} /g, rewardTitle);
          messageText = messageText.replace(/\{\{coupon_code\}\} /g, coupon.code);
          messageText = messageText.replace(/\{\{restaurant_name\}\} /g, restaurant.name || '');
          messageText = messageText.replace(/\{\{expires_at\}\} /g, coupon.expires_at ? coupon.expires_at.toLocaleDateString('pt-BR') : 'em breve');

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsapp_api_url,
            restaurant.whatsapp_api_key,
            restaurant.whatsapp_instance_id,
            customer.phone,
            messageText
          );

          if (whatsappResponse.success) {
            console.log(`Lembrete de cupom ${coupon.code} enviado com sucesso para ${customer.phone}`);
            await coupon.update({
              reminder_sent: true,
              reminder_sent_at: new Date()
            });
            // Opcional: Registrar o envio da mensagem no banco de dados
            await models.WhatsAppMessage.create({
              phone_number: customer.phone,
              message_text: messageText,
              message_type: 'coupon_reminder',
              status: 'sent',
              whatsapp_message_id: whatsappResponse.data?.id || null,
              restaurant_id: restaurant.id,
              customer_id: customer.id,
              coupon_id: coupon.id
            });
          } else {
            console.error(`Erro ao enviar lembrete de cupom ${coupon.code} para ${customer.phone}:`, whatsappResponse.error);
          }

          // Pequeno delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Erro ao processar cupom ${coupon.id}:`, error);
      }
    }

    console.log('Envio de lembretes de cupons concluído.');

  } catch (error) {
    console.error('Erro geral no envio de lembretes de cupons:', error);
  } finally {
    // Fechar a conexão com o banco de dados se este script for executado de forma independente
    // await sequelize.close();
  }
}

// Para execução via linha de comando
if (require.main === module) {
  sendCouponReminders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro fatal no script de lembretes de cupons:', err);
      process.exit(1);
    });
}

module.exports = sendCouponReminders;