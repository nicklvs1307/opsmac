import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Assuming you use React Router
// import apiClient from '../../api/axiosInstance'; // Create this to call your backend
import './LabelsDashboard.css'; // We will create this CSS file

const LabelsDashboard = () => {
    // Example state
    const [stats, setStats] = useState({
        yesterday: 0,
        today: 0,
        tomorrow: 0,
    });

    // useEffect(() => {
    //     // Fetch dashboard data from your API
    //     // apiClient.get('/labels/stats').then(response => {
    //     //     setStats(response.data);
    //     // });
    // }, []);

    return (
        <div className="labels-dashboard">
            <main className="main-content">
                <section id="inicio-section" className="content-section">
                    <div className="top-cards">
                        <div className="card">
                            <div className="card-icon-large"><i className="fas fa-print"></i></div>
                            <h3>Impressão em grupo</h3>
                            <p>Imprima múltiplos produtos através da funcionalidade de impressão em grupo.</p>
                            <Link to='/labels/print' className='btn btn-primary'>Fazer impressão</Link>
                        </div>
                        <div className="card">
                            <div className="card-icon-large"><i className="fas fa-trash-alt"></i></div>
                            <h3>Exclusão de etiquetas</h3>
                            <p>Exclua etiquetas já utilizadas e mantenha o controle de seus produtos.</p>
                            <button className="btn btn-secondary">Excluir etiquetas</button>
                        </div>
                        <div className="card">
                            <div className="card-icon-large"><i className="fas fa-utensils"></i></div>
                            <h3>Produção de insumos</h3>
                            <p>Acompanhe produtos processados em sua cozinha.</p>
                            <button className="btn btn-secondary">Ver produção</button>
                        </div>
                        <div className="card">
                            <div className="card-icon-large"><i className="fas fa-qrcode"></i></div>
                            <h3>Contagem de produtos</h3>
                            <p>Realize a contagem de produtos através da leitura de QR Code.</p>
                            <button className="btn btn-secondary">Iniciar contagem</button>
                        </div>
                        <div className="card">
                            <div className="card-icon-large"><i className="fas fa-history"></i></div>
                            <h3>Histórico de contagens</h3>
                            <p>Visualize o histórico de contagens realizadas.</p>
                            <button className="btn btn-secondary">Ver histórico</button>
                        </div>
                    </div>
                </section>

                <section id="novos-servicos-section" className="content-section">
                    <h2>Novos serviços</h2>
                    <p>Conheça as novas funcionalidades da Etiquetafy.</p>
                    <div className="service-cards">
                        {/* These could also be components */}
                        <div className="card horizontal">
                            <div className="card-content">
                                <h4>Contagem de produtos</h4>
                                <p>Agora é possível conferir os produtos impressos disponíveis em sua cozinha.</p>
                            </div>
                        </div>
                        <div className="card horizontal">
                            <div className="card-content">
                                <h4>Produtos controlados</h4>
                                <p>Agora é possível monitorar todos produtos ativos em nosso sistema.</p>
                            </div>
                        </div>
                        <div className="card horizontal">
                            <div className="card-content">
                                <h4>Recebimento de produtos</h4>
                                <p>Agora é possível fazer o recebimento dos produtos que estão chegando.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LabelsDashboard;
