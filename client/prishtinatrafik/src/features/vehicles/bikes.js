export const bikes = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  lat: 42.6629 + (Math.random() - 0.5) * 0.05,
  lng: 21.1655 + (Math.random() - 0.5) * 0.05,
}));