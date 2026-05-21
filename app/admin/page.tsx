'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, LogOut, Plus, Trash2, LayoutDashboard, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Geral',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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

    const { data: storeData } = await supabase.from('stores').select('*').eq('user_id', session.user.id).single();
    if (!storeData) { router.push('/register'); return; }

    setStore(storeData);
    fetchProducts(storeData.id);
    setLoading(false);
  };

  const fetchProducts = async (storeId: string) => {
    const { data } = await supabase.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
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
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        };
      };
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const formDataCloud = new FormData();
      formDataCloud.append('file', compressedBlob);
      formDataCloud.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formDataCloud });
      if (!response.ok) throw new Error('Erro no upload');
      const data = await response.json();
      return data.secure_url;
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
      category: formData.category,
    });

    if (!error) {
      setFormData({ name: '', price: '', description: '', category: 'Geral' });
      setImageFile(null);
      setImagePreview('');
      fetchProducts(store.id);
    } else {
      alert('Erro ao adicionar produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!store) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts(store.id);
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
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{store?.name}</h1>
              <p className="text-xs text-gray-500">Painel de Administração</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <a href={`/s/${store?.slug}`} target="_blank" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg transition">
              <LayoutDashboard className="w-4 h-4" /> Ver Loja
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Novo Produto
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-gray-600 px-4 py-3 rounded-lg transition flex-grow text-center text-sm">
                    {imageFile ? imageFile.name : '📁 Escolher Arquivo'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50"
                  placeholder="Ex: Ténis Nike Air"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (Kz)</label>
                  <input
                    type="number" required value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50"
                    placeholder="Ex: Roupas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50"
                  rows={2} placeholder="Breve descrição..."
                />
              </div>

              <button
                type="submit" disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                {uploading ? 'Enviando...' : 'Adicionar Produto'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Seus Produtos
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{products.length}</span>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:shadow-md transition bg-white group">
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-blue-600 font-bold text-sm">{product.price.toLocaleString('pt-AO')} Kz</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{product.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
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
