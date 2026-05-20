export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const storeInfo = {
  name: 'Minha Loja Angola',
  whatsappNumber: '244923456789', // Cambia esto por tu número real
  currency: 'Kz',
};

// Funciones para manejar datos en localStorage
export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('luanda_shop_products');
  if (stored) return JSON.parse(stored);
  
  // Datos iniciales de ejemplo si está vacío
  const initialProducts: Product[] = [
    {
      id: '1',
      name: 'Camiseta Polo Premium',
      price: 8500,
      image: 'https://placehold.co/400x400?text=Camiseta',
      description: 'Camiseta de algodăo 100%, disponível em várias tamanhos.',
    },
    {
      id: '2',
      name: 'Ténis Desportivos Run',
      price: 25000,
      image: 'https://placehold.co/400x400?text=Ténis',
      description: 'Ténis leves para correr, sola antiderrapante.',
    },
  ];
  localStorage.setItem('luanda_shop_products', JSON.stringify(initialProducts));
  return initialProducts;
};

export const addProduct = (product: Product) => {
  const products = getProducts();
  const newProducts = [...products, { ...product, id: Date.now().toString() }];
  localStorage.setItem('luanda_shop_products', JSON.stringify(newProducts));
};

export const deleteProduct = (id: string) => {
  const products = getProducts();
  const newProducts = products.filter(p => p.id !== id);
  localStorage.setItem('luanda_shop_products', JSON.stringify(newProducts));
};
