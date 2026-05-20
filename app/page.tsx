import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Crie sua Loja Online em Angola
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Venda seus produtos pelo WhatsApp de forma profissional. 
          Catálogo online, pedidos automáticos e gestão fácil.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
          >
            Criar Conta Grátis
          </Link>
          <Link 
            href="/login"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg transition text-lg"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-bold text-gray-900">Catálogo Fácil</h3>
            <p className="text-sm text-gray-500">Adicione produtos com fotos e preços em segundos.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-bold text-gray-900">Pedidos no WhatsApp</h3>
            <p className="text-sm text-gray-500">Seus clientes pedem direto no seu WhatsApp.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-bold text-gray-900">Link Exclusivo</h3>
            <p className="text-sm text-gray-500">Compartilhe seu link único nas redes sociais.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
