// Template HTML do Dashboard Financeiro
const dashboardFinanceiroHTML = `
<!-- ==========================================
     DASHBOARD FINANCEIRO - CRM v3.0
     ========================================== -->

<!-- Cards de Análise Financeira -->
<div class="financial-metrics">
    <div class="metric-row">
        <div class="metric-card total-vendas">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
                <h3>Total em Vendas</h3>
                <p class="metric-value" id="totalVendas">R$ 0,00</p>
                <span class="metric-label">Soma de todos os clientes</span>
            </div>
        </div>

        <div class="metric-card ticket-medio">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
                <h3>Ticket Médio</h3>
                <p class="metric-value" id="ticketMedio">R$ 0,00</p>
                <span class="metric-label">Valor médio por cliente</span>
            </div>
        </div>

        <div class="metric-card maior-compra">
            <div class="metric-icon">🏆</div>
            <div class="metric-content">
                <h3>Maior Compra</h3>
                <p class="metric-value" id="maiorCompra">R$ 0,00</p>
                <span class="metric-label" id="clienteMaiorCompra">-</span>
            </div>
        </div>

        <div class="metric-card menor-compra">
            <div class="metric-icon">📉</div>
            <div class="metric-content">
                <h3>Menor Compra</h3>
                <p class="metric-value" id="menorCompra">R$ 0,00</p>
                <span class="metric-label" id="clienteMenorCompra">-</span>
            </div>
        </div>
    </div>

    <div class="metric-row">
        <div class="metric-card clientes-vip">
            <div class="metric-icon">⭐</div>
            <div class="metric-content">
                <h3>Clientes VIP</h3>
                <p class="metric-value" id="clientesVIP">0</p>
                <span class="metric-label">Acima de R$ 1.000</span>
            </div>
        </div>

        <div class="metric-card clientes-premium">
            <div class="metric-icon">💎</div>
            <div class="metric-content">
                <h3>Clientes Premium</h3>
                <p class="metric-value" id="clientesPremium">0</p>
                <span class="metric-label">Entre R$ 500 - R$ 1.000</span>
            </div>
        </div>

        <div class="metric-card clientes-elite">
            <div class="metric-icon">👑</div>
            <div class="metric-content">
                <h3>Clientes Elite</h3>
                <p class="metric-value" id="clientesElite">0</p>
                <span class="metric-label">Acima de R$ 5.000</span>
            </div>
        </div>

        <div class="metric-card oportunidades">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
                <h3>Oportunidades</h3>
                <p class="metric-value" id="oportunidades">0</p>
                <span class="metric-label">Potencial crescimento</span>
            </div>
        </div>
    </div>
</div>

<!-- Gráfico de Distribuição -->
<div class="chart-container">
    <h3>📊 Distribuição de Clientes por Valor</h3>
    <div id="distribuicaoChart" class="distribution-chart"></div>
</div>

<!-- Ranking Top 10 -->
<div class="ranking-container">
    <h3>🏆 Top 10 Clientes por Valor Total</h3>
    <div id="rankingTop10" class="ranking-list"></div>
</div>

<!-- Ações Rápidas -->
<div class="quick-actions">
    <h3>⚡ Ações Rápidas</h3>
    <div class="action-buttons">
        <button onclick="DashboardFinanceiro.acaoRapidaVIPs()" class="action-btn vip">
            <span>⭐</span> Exportar VIPs
        </button>
        <button onclick="DashboardFinanceiro.acaoRapidaReativar()" class="action-btn reativar">
            <span>🔄</span> Reativar Inativos
        </button>
        <button onclick="DashboardFinanceiro.acaoRapidaCrescimento()" class="action-btn crescimento">
            <span>📈</span> Potencial Crescimento
        </button>
        <button onclick="DashboardFinanceiro.acaoRapidaAniversariantes()" class="action-btn aniversario">
            <span>🎂</span> Aniversariantes
        </button>
    </div>
</div>

<!-- Filtros Avançados por Valor -->
<div class="advanced-filters">
    <h3>🔍 Filtros Avançados por Valor</h3>
    <div class="filter-group">
        <label>Valor Mínimo:</label>
        <input type="number" id="filtroValorMin" placeholder="R$ 0,00" step="0.01">
        
        <label>Valor Máximo:</label>
        <input type="number" id="filtroValorMax" placeholder="R$ 10.000,00" step="0.01">
        
        <button onclick="DashboardFinanceiro.aplicarFiltroValor()" class="button">Aplicar Filtro</button>
        <button onclick="DashboardFinanceiro.limparFiltrosValor()" class="button secondary">Limpar</button>
    </div>
    
    <div class="quick-filters">
        <button onclick="DashboardFinanceiro.aplicarFiltroValor(0, 100)" class="quick-filter-btn">Até R$ 100</button>
        <button onclick="DashboardFinanceiro.aplicarFiltroValor(100, 500)" class="quick-filter-btn">R$ 100 - R$ 500</button>
        <button onclick="DashboardFinanceiro.aplicarFiltroValor(500, 1000)" class="quick-filter-btn">R$ 500 - R$ 1.000</button>
        <button onclick="DashboardFinanceiro.aplicarFiltroValor(1000, 5000)" class="quick-filter-btn">R$ 1.000 - R$ 5.000</button>
        <button onclick="DashboardFinanceiro.aplicarFiltroValor(5000, Infinity)" class="quick-filter-btn">Acima R$ 5.000</button>
    </div>
</div>
`;

// Injeta o HTML no container quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDashboardHTML);
} else {
    injectDashboardHTML();
}

function injectDashboardHTML() {
    const container = document.getElementById('dashboard-financeiro-container');
    if (container) {
        container.innerHTML = dashboardFinanceiroHTML;
        console.log('✅ Dashboard Financeiro HTML injetado');
    }
}
