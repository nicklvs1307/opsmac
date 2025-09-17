export const calculateNPS = (promoters, passives, detractors) => {
  const total = promoters + passives + detractors;
  if (total === 0) return 0;
  return ((promoters - detractors) / total) * 100;
};
