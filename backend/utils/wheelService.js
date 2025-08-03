const spinWheel = (wheelConfig) => {
  if (!wheelConfig || !Array.isArray(wheelConfig.items) || wheelConfig.items.length === 0) {
    throw new Error("Configuração da roleta inválida ou vazia.");
  }

  let totalProbability = 0;
  for (const item of wheelConfig.items) {
    totalProbability += item.probability;
  }
  console.log('wheelService - totalProbability:', totalProbability);

  if (totalProbability === 0) {
    throw new Error("A soma das probabilidades dos itens da roleta deve ser maior que zero.");
  }

  let randomNumber = Math.random() * totalProbability;
  console.log('wheelService - randomNumber:', randomNumber);

  for (let i = 0; i < wheelConfig.items.length; i++) {
    const item = wheelConfig.items[i];
    console.log(`wheelService - Item ${i}: probability=${item.probability}, randomNumber=${randomNumber}, condition=${randomNumber < item.probability}`);
    if (randomNumber < item.probability) {
      console.log('wheelService - Returning winning item (loop):', { winningItem: item, winningIndex: i });
      return { winningItem: item, winningIndex: i };
    }
    randomNumber -= item.probability;
  }

  // Fallback: Se por algum motivo não cair em nenhum, retorna o último item e seu índice
  const fallbackItem = wheelConfig.items[wheelConfig.items.length - 1];
  const fallbackIndex = wheelConfig.items.length - 1;
  console.log('wheelService - Returning fallback item:', { winningItem: fallbackItem, winningIndex: fallbackIndex });
  return { winningItem: fallbackItem, winningIndex: fallbackIndex };
};

module.exports = { spinWheel };
