const { models, sequelize } = require('config/config');
const { sendWhatsAppMessage } = require('~/services/integrations/whatsappApiClient');

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

        if (!restaurant.whatsappApiUrl || !restaurant.whatsappApiKey || !restaurant.whatsappInstanceId || !restaurant.whatsappPhoneNumber) {
          console.warn(`Cupom ${coupon.id}: Credenciais da Evolution API incompletas para o restaurante ${restaurant.id}. Pulando.`);
          continue;
        }

        const couponReminderEnabled = restaurant.settings?.whatsappMessages?.couponReminderEnabled;
        const customCouponReminderMessage = restaurant.settings?.whatsappMessages?.couponReminderText;

        if (couponReminderEnabled) {
          const reward = await models.Reward.findByPk(coupon.rewardId);
          const rewardTitle = reward ? reward.title : 'seu benefício';

          let messageText = customCouponReminderMessage || `Olá {{customer_name}}! 👋\n\nLembrete: Você tem um cupom ativo de *{{reward_title}}* ({{coupon_code}}) no *{{restaurant_name}}* que expira em breve!\n\nNão perca essa chance! Resgate seu cupom antes de {{expires_at}}.\n\nEsperamos por você! 😉`;

          // Substituir variáveis
          messageText = messageText.replace(/\{\{customer_name\}\} /g, customer.name || '');
          messageText = messageText.replace(/\{\{reward_title\}\} /g, rewardTitle);
          messageText = messageText.replace(/\{\{coupon_code\}\} /g, coupon.code);
          messageText = messageText.replace(/\{\{restaurant_name\}\} /g, restaurant.name || '');
          messageText = messageText.replace(/\{\{expires_at\}\} /g, coupon.expiresAt ? coupon.expiresAt.toLocaleDateString('pt-BR') : 'em breve');

          const whatsappResponse = await sendWhatsAppMessage(
            restaurant.whatsappApiUrl,
            restaurant.whatsappApiKey,
            restaurant.whatsappInstanceId,
            customer.phone,
            messageText
          );

          if (whatsappResponse.success) {
            console.log(`Lembrete de cupom ${coupon.code} enviado com sucesso para ${customer.phone}`);
            await coupon.update({
              reminderSent: true,
              reminderSentAt: new Date()
            });
            // Opcional: Registrar o envio da mensagem no banco de dados
            await models.WhatsAppMessage.create({
              phoneNumber: customer.phone,
              messageText: messageText,
              messageType: 'coupon_reminder',
              status: 'sent',
              whatsappMessageId: whatsappResponse.data?.id || null,
              restaurantId: restaurant.id,
              customerId: customer.id,
              couponId: coupon.id
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