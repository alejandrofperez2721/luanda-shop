'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Configuración de Cloudinary
  const CLOUD_NAME = 'dvfar3pjn';
  const UPLOAD_PRESET = 'luanda-shop';

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (storeError || !storeData) {
      router.push('/register');
      return;
    }

    setStore(storeData);
    fetchProducts(storeData.id);
    setLoading(false);
  };

  const fetchProducts = async (storeId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      // 1. Comprimir imagen
      const compressedBlob = await compressImage(file);
      const formDataCloud = new FormData();
      formDataCloud.append('file', compressedBlob);
      formDataCloud.append('upload_preset', UPLOAD_PRESET);

      // 2. Subir a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataCloud,
        }
      );

      if (!response.ok) throw new Error('Erro no upload para Cloudinary');

      const data = await response.json();
      return data.secure_url; // URL segura (HTTPS) de la imagen optimizada

    } catch (err: any) {
      alert('Erro ao enviar imagem: ' + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !formData.name || !formData.price) return;

    let imageUrl = 'https://placehold.co/400x400?text=Sem+Foto';

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
      else return;
    }

    const { error } = await supabase.from('products').insert({
      store_id: store.id,
      name: formData.name,
      price: Number(formData.price),
      image_url: imageUrl,
      description: formData.description,
    });

    if (!error) {
      setFormData({ name: '', price: '', description: '' });
      setImageFile(null);
      setImagePreview('');
      fetchProducts(store.id);
    } else {
      alert('Erro ao adicionar produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!store) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      fetchProducts(store.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{store?.name}</h1>
            <p className="text-xs text-gray-500">Painel de Administração</p>
          </div>
          <div className="flex gap-4 items-center">
            <a href={`/s/${store?.slug}`} target="_blank" className="text-sm text-green-600 hover:underline font-medium">
              Ver Loja Pública ↗
            </a>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Adicionar Produto</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              
              {/* Input de Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition flex-grow text-center">
                    {imageFile ? imageFile.name : 'Escolher Arquivo'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-md border" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="Ex: Ténis Nike Air"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (Kz)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="Ex: 15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  rows={3}
                  placeholder="Breve descrição..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {uploading ? 'Enviando para Cloudinary...' : 'Adicionar Produto'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Seus Produtos ({products.length})</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Nenhum produto cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded-md bg-gray-200"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.price.toLocaleString('pt-AO')} Kz</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
