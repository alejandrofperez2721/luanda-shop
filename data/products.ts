export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Camiseta Polo Premium',
    price: 8500,
    image: 'https://placehold.co/400x400?text=Camiseta',
    description: 'Camiseta de algodón 100%, disponible en varias tallas.',
  },
  {
    id: '2',
    name: 'Zapatillas Deportivas Run',
    price: 25000,
    image: 'https://placehold.co/400x400?text=Zapatillas',
    description: 'Zapatillas ligeras para correr, suela antideslizante.',
  },
  {
    id: '3',
    name: 'Reloj Inteligente SmartWatch',
    price: 45000,
    image: 'https://placehold.co/400x400?text=Reloj',
    description: 'Monitor de ritmo cardíaco, notificaciones y batería de larga duración.',
  },
  {
    id: '4',
    name: 'Mochila Urbana Resistente',
    price: 12000,
    image: 'https://placehold.co/400x400?text=Mochila',
    description: 'Impermeable, compartimento para laptop de 15 pulgadas.',
  },
];

export const storeInfo = {
  name: 'Luanda Store Demo',
  whatsappNumber: '244923456789', // Número de ejemplo de Angola
};
