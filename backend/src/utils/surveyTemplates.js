const surveyTemplates = {
  delivery_csat: {
    title: "Pesquisa de Satisfação (Delivery CSAT)",
    description:
      "Entenda a satisfação do seu cliente com o serviço de delivery.",
    questions: [
      {
        question_text:
          "Em uma escala de 1 a 5, qual sua satisfação geral com nosso serviço de delivery?",
        question_type: "csat", // 1-5 scale
        order: 1,
      },
      {
        question_text:
          "O que podemos fazer para melhorar sua próxima experiência?",
        question_type: "textarea",
        order: 2,
      },
    ],
  },
  menu_feedback: {
    title: "Feedback do Cardápio",
    description:
      "Ajude-nos a entender o que você pensa sobre nossas opções de pratos.",
    questions: [
      {
        question_text: "Quais pratos você mais gostou?",
        question_type: "textarea",
        order: 1,
      },
      {
        question_text: "Quais pratos você menos gostou?",
        question_type: "textarea",
        order: 2,
      },
      {
        question_text:
          "Existe algo que você gostaria de ver em nosso cardápio?",
        question_type: "textarea",
        order: 3,
      },
    ],
  },
  customer_profile: {
    title: "Conhecendo Nosso Cliente",
    description:
      "Queremos entender melhor suas preferências para oferecer o melhor serviço.",
    questions: [
      {
        question_text: "Como você conheceu nosso restaurante?",
        question_type: "text",
        order: 1,
      },
      {
        question_text: "Qual o principal motivo da sua visita hoje?",
        question_type: "text",
        order: 2,
      },
      {
        question_text:
          "Se você não tivesse escolhido a gente, qual seria sua segunda opção?",
        question_type: "text",
        order: 3,
      },
    ],
  },
  nps_only: {
    title: "Pesquisa de NPS",
    description: "Uma única pergunta para medir a lealdade dos seus clientes.",
    questions: [
      {
        question_text:
          "Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo ou familiar?",
        question_type: "nps", // 0-10 scale
        order: 1,
      },
    ],
  },
  salon_ratings: {
    title: "Avaliação do Salão (Ratings)",
    description: "Avalie sua experiência em nosso salão.",
    questions: [
      {
        question_text: "Como você avalia a qualidade da nossa comida?",
        question_type: "ratings", // 1-5 stars
        order: 1,
      },
      {
        question_text: "Como você avalia a qualidade do nosso atendimento?",
        question_type: "ratings",
        order: 2,
      },
      {
        question_text:
          "Como você avalia a limpeza e o ambiente do nosso restaurante?",
        question_type: "ratings",
        order: 3,
      },
      {
        question_text: "Deixe um comentário ou sugestão:",
        question_type: "textarea",
        order: 4,
      },
    ],
  },
  salon_like_dislike: {
    title: "Avaliação do Salão (Like/Dislike)",
    description: "Nos diga de forma rápida o que você achou.",
    questions: [
      {
        question_text: "Você gostou da sua experiência hoje?",
        question_type: "like_dislike",
        order: 1,
      },
      {
        question_text:
          "Poderia nos contar um pouco mais sobre o motivo da sua avaliação?",
        question_type: "textarea",
        order: 2,
      },
    ],
  },
  performance_review: {
    title: "Avaliação de Desempenho",
    description: "Avalie o desempenho da sua equipe ou de um indivíduo.",
    questions: [
      {
        question_text: "Quais são os pontos fortes do colaborador?",
        question_type: "textarea",
        order: 1,
      },
      {
        question_text: "Quais são os pontos a serem desenvolvidos?",
        question_type: "textarea",
        order: 2,
      },
      {
        question_text: "Comentários adicionais:",
        question_type: "textarea",
        order: 3,
      },
    ],
  },
  salon_nps: {
    title: "Pesquisa de NPS (Salão)",
    description: "Meça a lealdade dos clientes que visitam seu salão.",
    questions: [
      {
        question_text:
          "Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo ou familiar após sua visita ao salão?",
        question_type: "nps",
        order: 1,
      },
    ],
  },
  delivery_nps: {
    title: "Pesquisa de NPS (Delivery)",
    description:
      "Meça a lealdade dos clientes que utilizam seu serviço de delivery.",
    questions: [
      {
        question_text:
          "Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo ou familiar após sua experiência com o delivery?",
        question_type: "nps",
        order: 1,
      },
    ],
  },
  salon_csat: {
    title: "Pesquisa de Satisfação (Salão CSAT)",
    description:
      "Entenda a satisfação do seu cliente com a experiência no salão.",
    questions: [
      {
        question_text:
          "Em uma escala de 1 a 5, qual sua satisfação geral com sua visita ao nosso salão?",
        question_type: "csat",
        order: 1,
      },
      {
        question_text: "O que podemos fazer para melhorar sua próxima visita?",
        question_type: "textarea",
        order: 2,
      },
    ],
  },
  service_checklist: {
    title: "Checklist de Serviço",
    description: "Verifique a qualidade do serviço com um checklist.",
    questions: [
      {
        question_text: "O serviço foi entregue conforme o esperado?",
        question_type: "boolean",
        order: 1,
      },
      {
        question_text: "Houve algum problema durante o serviço?",
        question_type: "textarea",
        order: 2,
      },
    ],
  },
  // Adicione outros templates aqui conforme a necessidade (salon_nps, delivery_nps, etc.)
};

module.exports = { surveyTemplates };
