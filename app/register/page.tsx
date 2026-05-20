'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeName: '',
    slug: '',
    whatsapp: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Intentar registrar
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      let userId = authData?.user?.id;

      // 2. Si el usuario ya existe, hacemos login
      if (authError?.message?.includes('already registered') || authError?.message?.includes('already been registered')) {
        console.log('Usuario ya existe, intentando login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (loginError) throw loginError;
        userId = loginData?.user?.id;
      } else if (authError) {
        throw authError;
      }

      if (!userId) throw new Error('Não foi possível obter o ID do usuário.');

      // 3. Verificar si ya tiene tienda
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingStore) {
        alert('Conta já existe. Redirecionando...');
        router.push('/admin');
        return;
      }

      // 4. Crear la tienda
      const { error: storeError } = await supabase.from('stores').insert({
        user_id: userId,
        name: formData.storeName,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        whatsapp: formData.whatsapp,
      });

      if (storeError) throw storeError;

      alert('Conta e Loja criadas com sucesso!');
      router.push('/admin');
      router.refresh();

    } catch (err: any) {
      console.error('Erro completo:', err);
      // Mostrar el mensaje técnico real
      setError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Criar Nova Loja</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm break-words">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Ex: Moda Luanda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link da Loja (Slug)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Ex: moda-luanda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Ex: 244923456789"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Criar Conta e Loja'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Já tem conta? <a href="/login" className="text-blue-600 hover:underline">Faça login</a>
        </p>
      </div>
    </main>
  );
}
