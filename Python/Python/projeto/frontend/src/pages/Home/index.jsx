import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-verde-dark via-verde to-verde-light text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Juntos por cidades mais limpas</h1>
        <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-10">
          Registre pontos de descarte irregular de lixo e ajude sua cidade a agir mais rápido.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/denuncia/nova" className="bg-white text-verde font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors text-lg shadow-lg">
            Fazer uma Denúncia
          </Link>
          <Link to="/mapa" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-verde transition-colors text-lg">
            Ver Mapa
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: '1. Fotografe', desc: 'Tire uma foto do local com descarte irregular.' },
              { icon: '📍', title: '2. Registre', desc: 'Informe a localização e uma breve descrição.' },
              { icon: '🏛️', title: '3. Acompanhe', desc: 'Veja o status e aguarde o atendimento da prefeitura.' }
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-verde mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ODS CTA */}
      <section className="bg-verde-dark text-white py-12 px-4 text-center">
        <p className="text-xl font-semibold mb-2">🌍 Alinhado ao ODS 11</p>
        <p className="text-green-200 max-w-xl mx-auto">
          Cidades e Comunidades Sustentáveis — fazemos parte da Agenda 2030 da ONU.
        </p>
      </section>

      <Footer />
    </div>
  );
}
