export const spinWheel = (wheelConfig) => {
  if (
    !wheelConfig ||
    !Array.isArray(wheelConfig.items) ||
    wheelConfig.items.length === 0
  ) {
    throw new Error("Configuração da roleta inválida ou vazia.");
  }

  let totalProbability = 0;
  for (const item of wheelConfig.items) {
    totalProbability += item.probability;
  }

  if (totalProbability === 0) {
    throw new Error(
      "A soma das probabilidades dos itens da roleta deve ser maior que zero.",
    );
  }

  let randomNumber = Math.random() * totalProbability;

  for (let i = 0; i < wheelConfig.items.length; i++) {
    const item = wheelConfig.items[i];
    if (randomNumber < item.probability) {
      return { winningItem: item, winningIndex: i };
    }
    randomNumber -= item.probability;
  }

  // Fallback: Se por algum motivo não cair em nenhum, retorna o último item e seu índice
  const fallbackItem = wheelConfig.items[wheelConfig.items.length - 1];
  const fallbackIndex = wheelConfig.items.length - 1;
  return { winningItem: fallbackItem, winningIndex: fallbackIndex };
};


