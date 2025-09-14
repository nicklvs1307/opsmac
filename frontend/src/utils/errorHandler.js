import toast from 'react-hot-toast';

export const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;

    switch (status) {
      case 400:
        toast.error(data.message || 'Requisição inválida.');
        break;
      case 401:
        toast.error(data.message || 'Não autorizado. Por favor, faça login novamente.');
        // Optionally, redirect to login page
        window.location.href = '/login';
        break;
      case 403:
        toast.error(data.message || 'Você não tem permissão para acessar este recurso.');
        break;
      case 404:
        toast.error(data.message || 'Recurso não encontrado.');
        break;
      case 409:
        toast.error(data.message || 'Conflito. O recurso já existe ou há um problema de concorrência.');
        break;
      case 422:
        toast.error(data.message || 'Dados inválidos. Verifique os campos e tente novamente.');
        break;
      case 500:
        toast.error(data.message || 'Erro interno do servidor. Por favor, tente novamente mais tarde.');
        break;
      default:
        toast.error(data.message || `Erro ${status}: Algo deu errado.`);
    }
  } else if (error.request) {
    // The request was made but no response was received
    toast.error('Erro de rede: Não foi possível conectar ao servidor. Verifique sua conexão.');
  } else {
    // Something happened in setting up the request that triggered an Error
    toast.error('Erro inesperado: Algo deu muito errado.');
  }
  console.error(error);
};
