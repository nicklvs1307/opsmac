export const getSegmentColor = (segment) => {
  switch (segment) {
    case 'vip':
      return 'error';
    case 'regular':
      return 'primary';
    case 'new':
      return 'success';
    case 'inactive':
      return 'default';
    default:
      return 'default';
  }
};

export const getSegmentLabel = (segment) => {
  switch (segment) {
    case 'vip':
      return 'VIP';
    case 'regular':
      return 'Regular';
    case 'new':
      return 'Novo';
    case 'inactive':
      return 'Inativo';
    default:
      return segment;
  }
};
