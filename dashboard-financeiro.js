// ==========================================
// DASHBOARD FINANCEIRO - INTERFACE
// ==========================================

/**
 * Renderiza o dashboard financeiro completo
 */
function renderDashboardFinanceiro() {
    const stats = FinanceiroModule.calcularEstatisticasFinanceiras();
    
    // Atualizar cards
    atualizarCardsFinanceiros(stats);
    
    // Renderizar gráfico de distribuição
    renderGraficoDistribuicao(stats.distribuicao);
    
    // Renderizar ranking
    renderRankingTop10();
}

/**
 * Atualiza os cards com métricas financeiras
 */
function atualizarCardsFinanceiros(stats) {
    // Total em Vendas
    const elTotalVendas = document.getElementById('totalVendas');
    if (elTotalVendas) {
        elTotalVendas.textContent = FinanceiroModule.formatarMoeda(stats.totalVendas);
    }
    
    // Ticket Médio
    const elTicketMedio = document.getElementById('ticketMedio');
    if (elTicketMedio) {
        elTicketMedio.textContent = FinanceiroModule.formatarMoeda(stats.ticketMedio);
    }
    
    // Maior Compra
    const elMaiorCompra = document.getElementById('maiorCompra');
    const elClienteMaiorCompra = document.getElementById('clienteMaiorCompra');
    if (elMaiorCompra && stats.maiorCompra.cliente) {
        elMaiorCompra.textContent = FinanceiroModule.formatarMoeda(stats.maiorCompra.valor);
        if (elClienteMaiorCompra) {
            elClienteMaiorCompra.textContent = stats.maiorCompra.cliente.nome;
        }
    }
    
    // Menor Compra
    const elMenorCompra = document.getElementById('menorCompra');
    const elClienteMenorCompra = document.getElementById('clienteMenorCompra');
    if (elMenorCompra && stats.menorCompra.cliente) {
        elMenorCompra.textContent = FinanceiroModule.formatarMoeda(stats.menorCompra.valor);
        if (elClienteMenorCompra) {
            elClienteMenorCompra.textContent = stats.menorCompra.cliente.nome;
        }
    }
    
    // Clientes VIP
    const elClientesVIP = document.getElementById('clientesVIP');
    if (elClientesVIP) {
        elClientesVIP.textContent = stats.clientesVIP;
    }
    
    // Clientes Premium
    const elClientesPremium = document.getElementById('clientesPremium');
    if (elClientesPremium) {
        elClientesPremium.textContent = stats.clientesPremium;
    }
    
    // Clientes Elite
    const elClientesElite = document.getElementById('clientesElite');
    if (elClientesElite) {
        elClientesElite.textContent = stats.clientesElite;
    }
    
    // Inativos Alto Valor
    const elInativosAltoValor = document.getElementById('inativosAltoValor');
    if (elInativosAltoValor) {
        elInativosAltoValor.textContent = stats.inativosAltoValor;
    }
}

/**
 * Renderiza gráfico de distribuição
 */
function renderGraficoDistribuicao(distribuicao) {
    const container = document.getElementById('distributionChart');
    if (!container) return;
    
    const total = Object.values(distribuicao).reduce((sum, val) => sum + val, 0);
    const maxValue = Math.max(...Object.values(distribuicao));
    
    container.innerHTML = '';
    
    Object.entries(distribuicao).forEach(([faixa, quantidade]) => {
        const percentual = maxValue > 0 ? (quantidade / maxValue) * 100 : 0;
        const barHTML = `
            <div class="chart-bar">
                <div class="chart-label">${faixa}</div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${percentual}%">
                        <span class="chart-value">${quantidade} clientes</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += barHTML;
    });
}

/**
 * Renderiza ranking de top 10 clientes
 */
function renderRankingTop10() {
    const container = document.getElementById('rankingList');
    if (!container) return;
    
    const topClientes = FinanceiroModule.getTopClientes(10);
    container.innerHTML = '';
    
    if (topClientes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9CA3AF;">Nenhum cliente com compras registradas</p>';
        return;
    }
    
    topClientes.forEach((client, index) => {
        const posicao = index + 1;
        const valor = parseFloat(client.valorTotal) || 0;
        const categoria = FinanceiroModule.classificarCliente(valor);
        const nomeCateg = FinanceiroModule.nomeCategoria(categoria);
        
        let positionClass = '';
        if (posicao === 1) positionClass = 'top1';
        else if (posicao === 2) positionClass = 'top2';
        else if (posicao === 3) positionClass = 'top3';
        
        let badgeClass = '';
        let badgeText = '';
        if (categoria === 'elite') {
            badgeClass = 'badge-elite';
            badgeText = '👑 Elite';
        } else if (categoria === 'premium') {
            badgeClass = 'badge-premium';
            badgeText = '💎 Premium';
        } else if (categoria === 'vip') {
            badgeClass = 'badge-vip';
            badgeText = '⭐ VIP';
        }
        
        const itemHTML = `
            <div class="ranking-item">
                <div class="ranking-position ${positionClass}">#${posicao}</div>
                <div class="ranking-info">
                    <div class="ranking-name">
                        ${client.nome}
                        ${badgeText ? `<span class="ranking-badge ${badgeClass}">${badgeText}</span>` : ''}
                    </div>
                    <div class="ranking-contact">
                        📱 ${client.telefone}
                        ${client.email ? ` • 📧 ${client.email}` : ''}
                    </div>
                </div>
                <div class="ranking-value">${FinanceiroModule.formatarMoeda(valor)}</div>
            </div>
        `;
        
        container.innerHTML += itemHTML;
    });
}

/**
 * Aplica filtros de valor
 */
function aplicarFiltroValor() {
    let clientesFiltrados = [...state.clients];
    
    // Aplicar filtros existentes primeiro
    clientesFiltrados = aplicarFiltrosGerais(clientesFiltrados);
    
    // Filtro de categoria
    const categoria = document.getElementById('filtroCategoria')?.value;
    if (categoria) {
        clientesFiltrados = FinanceiroModule.filtrarPorCategoria(clientesFiltrados, categoria);
    }
    
    // Filtro de valor mínimo e máximo
    const valorMin = parseFloat(document.getElementById('valorMinimo')?.value) || 0;
    const valorMax = parseFloat(document.getElementById('valorMaximo')?.value) || Infinity;
    clientesFiltrados = FinanceiroModule.filtrarPorValor(clientesFiltrados, valorMin, valorMax);
    
    // Filtro de Top N
    const topN = parseInt(document.getElementById('topClientes')?.value);
    if (topN) {
        clientesFiltrados = FinanceiroModule.getTopClientes(topN, clientesFiltrados);
    }
    
    // Ordenação por valor
    const ordem = document.getElementById('ordenarValor')?.value;
    if (ordem) {
        clientesFiltrados = FinanceiroModule.ordenarPorValor(clientesFiltrados, ordem);
    }
    
    state.filteredClients = clientesFiltrados;
    state.currentPage = 1;
    renderClientsTable();
    updateFilterCount();
}

/**
 * Limpa filtros de valor
 */
function limparFiltrosValor() {
    const elOrdenar = document.getElementById('ordenarValor');
    const elCategoria = document.getElementById('filtroCategoria');
    const elValorMin = document.getElementById('valorMinimo');
    const elValorMax = document.getElementById('valorMaximo');
    const elTopN = document.getElementById('topClientes');
    
    if (elOrdenar) elOrdenar.value = '';
    if (elCategoria) elCategoria.value = '';
    if (elValorMin) elValorMin.value = '';
    if (elValorMax) elValorMax.value = '';
    if (elTopN) elTopN.value = '';
    
    state.filteredClients = [...state.clients];
    state.currentPage = 1;
    renderClientsTable();
    updateFilterCount();
}

// ==========================================
// AÇÕES RÁPIDAS
// ==========================================

/**
 * Ação rápida: Campanha VIP
 */
function acaoRapidaVIPs() {
    const clientesVIP = FinanceiroModule.filtrarPorCategoria(state.clients, 'vip')
        .concat(FinanceiroModule.filtrarPorCategoria(state.clients, 'premium'))
        .concat(FinanceiroModule.filtrarPorCategoria(state.clients, 'elite'));
    
    if (clientesVIP.length === 0) {
        mostrarNotificacao('Nenhum cliente VIP encontrado', 'info');
        return;
    }
    
    // Aplicar filtro e selecionar todos
    state.filteredClients = clientesVIP;
    state.selectedClientIds = new Set(clientesVIP.map(c => c.id));
    
    renderClientsTable();
    updateSelectionCount();
    
    // Perguntar se quer exportar
    const confirma = confirm(`${clientesVIP.length} clientes VIP selecionados.\n\nDeseja exportar para WhatsApp?`);
    if (confirma) {
        FinanceiroModule.exportarComValor(clientesVIP, 'whatsapp-valor');
    }
}

/**
 * Ação rápida: Reativar alto valor
 */
function acaoRapidaReativar() {
    const inativos = FinanceiroModule.clientesInativosAltoValor(180, 2000);
    
    if (inativos.length === 0) {
        mostrarNotificacao('Nenhum cliente inativo de alto valor encontrado', 'info');
        return;
    }
    
    state.filteredClients = inativos;
    state.selectedClientIds = new Set(inativos.map(c => c.id));
    
    renderClientsTable();
    updateSelectionCount();
    
    const confirma = confirm(`${inativos.length} clientes inativos de alto valor encontrados.\n\nDeseja exportar para reativação?`);
    if (confirma) {
        FinanceiroModule.exportarComValor(inativos, 'completo');
    }
}

/**
 * Ação rápida: Crescimento (baixo ticket)
 */
function acaoRapidaCrescimento() {
    const clientesBaixoTicket = FinanceiroModule.filtrarPorValor(state.clients, 0, 500);
    const ativos = clientesBaixoTicket.filter(c => {
        const ativosRecentes = FinanceiroModule.clientesAtivosRecentes(60);
        return ativosRecentes.some(a => a.id === c.id);
    });
    
    if (ativos.length === 0) {
        mostrarNotificacao('Nenhum cliente de baixo ticket ativo encontrado', 'info');
        return;
    }
    
    state.filteredClients = ativos;
    state.selectedClientIds = new Set(ativos.map(c => c.id));
    
    renderClientsTable();
    updateSelectionCount();
    
    const confirma = confirm(`${ativos.length} clientes com potencial de crescimento.\n\nDeseja exportar para campanha de upsell?`);
    if (confirma) {
        FinanceiroModule.exportarComValor(ativos, 'whatsapp-valor');
    }
}

/**
 * Ação rápida: Aniversariantes VIP
 */
function acaoRapidaAniversariantes() {
    // Buscar aniversariantes do mês
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    
    const aniversariantes = state.clients.filter(client => {
        if (!client.dataNascimento) return false;
        
        const partes = client.dataNascimento.split('/');
        if (partes.length !== 3) return false;
        
        const mes = parseInt(partes[1]) - 1;
        return mes === mesAtual;
    });
    
    // Filtrar apenas VIPs
    const aniversariantesVIP = aniversariantes.filter(c => {
        const valor = parseFloat(c.valorTotal) || 0;
        return valor >= 5000;
    });
    
    if (aniversariantesVIP.length === 0) {
        mostrarNotificacao('Nenhum aniversariante VIP este mês', 'info');
        return;
    }
    
    state.filteredClients = aniversariantesVIP;
    state.selectedClientIds = new Set(aniversariantesVIP.map(c => c.id));
    
    renderClientsTable();
    updateSelectionCount();
    
    const confirma = confirm(`${aniversariantesVIP.length} aniversariantes VIP este mês.\n\nDeseja exportar para campanha de aniversário?`);
    if (confirma) {
        FinanceiroModule.exportarComValor(aniversariantesVIP, 'whatsapp-valor');
    }
}

/**
 * Mostra notificação
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Implementar sistema de notificações (toast)
    alert(mensagem);
}

/**
 * Aplica filtros gerais (estado, cidade, etc)
 */
function aplicarFiltrosGerais(clients) {
    // Esta função deve ser implementada no app.js principal
    // Por enquanto, retorna todos os clientes
    return clients;
}

/**
 * Atualiza contador de filtros
 */
function updateFilterCount() {
    // Esta função deve existir no app.js principal
    const count = state.filteredClients.length;
    console.log(`${count} clientes filtrados`);
}

/**
 * Atualiza contador de seleção
 */
function updateSelectionCount() {
    // Esta função deve existir no app.js principal
    const count = state.selectedClientIds.size;
    console.log(`${count} clientes selecionados`);
}

// Exporta funções globalmente
window.DashboardFinanceiro = {
    renderDashboardFinanceiro,
    atualizarCardsFinanceiros,
    renderGraficoDistribuicao,
    renderRankingTop10,
    aplicarFiltroValor,
    limparFiltrosValor,
    acaoRapidaVIPs,
    acaoRapidaReativar,
    acaoRapidaCrescimento,
    acaoRapidaAniversariantes
};

console.log('✅ Dashboard Financeiro UI carregado');
