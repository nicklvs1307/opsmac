import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LabelsDashboard = () => {
  const [stats, setStats] = useState({
    yesterday: 0,
    today: 0,
    tomorrow: 0,
  });

  return (
    <div className="p-8 bg-gray-50">
      <section id="inicio-section" className="mb-8" style={{ display: 'block' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-3xl text-red-500 mb-4">
              <i className="fas fa-print"></i>
            </div>
            <h3 className="mt-0 mb-2 font-semibold">Impressão em grupo</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Imprima múltiplos produtos através da funcionalidade de impressão em grupo.
            </p>
            <Link
              to="/cdv/labels/print"
              className="px-4 py-2 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out text-sm inline-flex items-center bg-red-500 text-white hover:bg-red-600"
            >
              Fazer impressão
            </Link>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-3xl text-red-500 mb-4">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="mt-0 mb-2 font-semibold">Exclusão de etiquetas</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Exclua etiquetas já utilizadas e mantenha o controle de seus produtos.
            </p>
            <Link
              to="/cdv/labels/delete"
              className="px-4 py-2 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out text-sm inline-flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Excluir etiquetas
            </Link>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-3xl text-red-500 mb-4">
              <i className="fas fa-utensils"></i>
            </div>
            <h3 className="mt-0 mb-2 font-semibold">Produção de insumos</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Acompanhe produtos processados em sua cozinha.
            </p>
            <Link
              to="/cdv/production"
              className="px-4 py-2 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out text-sm inline-flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Ver produção
            </Link>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-3xl text-red-500 mb-4">
              <i className="fas fa-qrcode"></i>
            </div>
            <h3 className="mt-0 mb-2 font-semibold">Contagem de produtos</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Realize a contagem de produtos através da leitura de QR Code.
            </p>
            <Link
              to="/cdv/labels/count"
              className="px-4 py-2 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out text-sm inline-flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Iniciar contagem
            </Link>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-3xl text-red-500 mb-4">
              <i className="fas fa-history"></i>
            </div>
            <h3 className="mt-0 mb-2 font-semibold">Histórico de contagens</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Visualize o histórico de contagens realizadas.
            </p>
            <Link
              to="/cdv/labels/count-history"
              className="px-4 py-2 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out text-sm inline-flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Ver histórico
            </Link>
          </div>
        </div>
      </section>

      <section id="novos-servicos-section" className="mb-8" style={{ display: 'block' }}>
        <h2 className="mt-0 mb-2 font-semibold">Novos serviços</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Conheça as novas funcionalidades da Etiquetafy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg flex items-start">
            <div className="mr-5">
              <img
                src="https://via.placeholder.com/40"
                alt=""
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h4 className="mt-0 mb-2 font-semibold">Contagem de produtos</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Agora é possível conferir os produtos impressos disponíveis em sua cozinha.
              </p>
              <ul className="pl-5 list-none mt-2">
                <li className="mb-1 text-gray-700 text-sm">Contagem escaneando QR Code</li>
                <li className="mb-1 text-gray-700 text-sm">Registros de todas as contagens</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg flex items-start">
            <div className="mr-5">
              <img
                src="https://via.placeholder.com/40"
                alt=""
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h4 className="mt-0 mb-2 font-semibold">Produtos controlados</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Agora é possível monitorar todos produtos ativos em nosso sistema.
              </p>
              <ul className="pl-5 list-none mt-2">
                <li className="mb-1 text-gray-700 text-sm">Contagem (incluso)</li>
                <li className="mb-1 text-gray-700 text-sm">Controle de produção e insumos</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg flex items-start">
            <div className="mr-5">
              <img
                src="https://via.placeholder.com/40"
                alt=""
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h4 className="mt-0 mb-2 font-semibold">Recebimento de produtos</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Agora é possível fazer o recebimento dos produtos que estão chegando.
              </p>
              <ul className="pl-5 list-none mt-2">
                <li className="mb-1 text-gray-700 text-sm">Registros de temperaturas</li>
                <li className="mb-1 text-gray-700 text-sm">Impressão de produtos (insumo)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LabelsDashboard;
