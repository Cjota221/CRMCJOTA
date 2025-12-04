// ==========================================
// MÓDULO DE ANÁLISE FINANCEIRA - CRM v3.0
// ==========================================

/**
 * Funções para análise de valor de compras
 * Calcula métricas financeiras, rankings e segmentações
 */

// ==========================================
// CÁLCULOS FINANCEIROS
// ==========================================

/**
 * Calcula o total de vendas de todos os clientes
 */
function calcularTotalVendas(clients = state.clients) {
    return clients.reduce((total, client) => {
        const valor = parseFloat(client.valorTotal) || 0;
        return total + valor;
    }, 0);
}

/**
 * Calcula o ticket médio
 */
function calcularTicketMedio(clients = state.clients) {
    const clientesComCompras = clients.filter(c => (parseFloat(c.valorTotal) || 0) > 0);
    if (clientesComCompras.length === 0) return 0;
    
    const total = calcularTotalVendas(clientesComCompras);
    return total / clientesComCompras.length;
}

/**
 * Encontra a maior compra
 */
function encontrarMaiorCompra(clients = state.clients) {
    if (clients.length === 0) return { cliente: null, valor: 0 };
    
    const clienteTop = clients.reduce((max, client) => {
        const valor = parseFloat(client.valorTotal) || 0;
        const maxValor = parseFloat(max.valorTotal) || 0;
        return valor > maxValor ? client : max;
    }, clients[0]);
    
    return {
        cliente: clienteTop,
        valor: parseFloat(clienteTop.valorTotal) || 0
    };
}

/**
 * Encontra a menor compra (excluindo zero)
 */
function encontrarMenorCompra(clients = state.clients) {
    const clientesComCompras = clients.filter(c => (parseFloat(c.valorTotal) || 0) > 0);
    if (clientesComCompras.length === 0) return { cliente: null, valor: 0 };
    
    const clienteMin = clientesComCompras.reduce((min, client) => {
        const valor = parseFloat(client.valorTotal) || 0;
        const minValor = parseFloat(min.valorTotal) || 0;
        return valor < minValor ? client : min;
    }, clientesComCompras[0]);
    
    return {
        cliente: clienteMin,
        valor: parseFloat(clienteMin.valorTotal) || 0
    };
}

/**
 * Conta clientes VIP (acima de um valor)
 */
function contarClientesVIP(valorMinimo = 5000, clients = state.clients) {
    return clients.filter(c => (parseFloat(c.valorTotal) || 0) >= valorMinimo).length;
}

/**
 * Classifica cliente por categoria
 */
function classificarCliente(valorTotal) {
    const valor = parseFloat(valorTotal) || 0;
    
    if (valor >= 50000) return 'elite';
    if (valor >= 10000) return 'premium';
    if (valor >= 5000) return 'vip';
    if (valor > 0) return 'regular';
    return 'novo';
}

/**
 * Retorna cor da categoria
 */
function corCategoria(categoria) {
    const cores = {
        'elite': '#8B0000',
        'premium': '#6B46C1',
        'vip': '#F59E0B',
        'regular': '#3B82F6',
        'novo': '#9CA3AF'
    };
    return cores[categoria] || cores.novo;
}

/**
 * Retorna nome legível da categoria
 */
function nomeCategoria(categoria) {
    const nomes = {
        'elite': '👑 Elite',
        'premium': '💎 Premium',
        'vip': '⭐ VIP',
        'regular': '👤 Regular',
        'novo': '🆕 Novo'
    };
    return nomes[categoria] || nomes.novo;
}

// ==========================================
// RANKINGS E ORDENAÇÃO
// ==========================================

/**
 * Retorna top N clientes por valor
 */
function getTopClientes(n = 10, clients = state.clients) {
    return [...clients]
        .sort((a, b) => (parseFloat(b.valorTotal) || 0) - (parseFloat(a.valorTotal) || 0))
        .slice(0, n);
}

/**
 * Ordena clientes por valor
 */
function ordenarPorValor(clients, ordem = 'desc') {
    return [...clients].sort((a, b) => {
        const valorA = parseFloat(a.valorTotal) || 0;
        const valorB = parseFloat(b.valorTotal) || 0;
        return ordem === 'desc' ? valorB - valorA : valorA - valorB;
    });
}

/**
 * Filtra clientes por faixa de valor
 */
function filtrarPorValor(clients, min = 0, max = Infinity) {
    return clients.filter(c => {
        const valor = parseFloat(c.valorTotal) || 0;
        return valor >= min && valor <= max;
    });
}

/**
 * Filtra clientes por categoria
 */
function filtrarPorCategoria(clients, categoria) {
    return clients.filter(c => classificarCliente(c.valorTotal) === categoria);
}

// ==========================================
// ANÁLISE E SEGMENTAÇÃO
// ==========================================

/**
 * Distribui clientes por faixas de valor
 */
function distribuicaoPorFaixa(clients = state.clients) {
    const faixas = {
        'Sem compras': 0,
        'R$ 0 - R$ 500': 0,
        'R$ 500 - R$ 1.000': 0,
        'R$ 1.000 - R$ 2.500': 0,
        'R$ 2.500 - R$ 5.000': 0,
        'R$ 5.000 - R$ 10.000': 0,
        'R$ 10.000 - R$ 50.000': 0,
        'R$ 50.000+': 0
    };
    
    clients.forEach(client => {
        const valor = parseFloat(client.valorTotal) || 0;
        
        if (valor === 0) faixas['Sem compras']++;
        else if (valor < 500) faixas['R$ 0 - R$ 500']++;
        else if (valor < 1000) faixas['R$ 500 - R$ 1.000']++;
        else if (valor < 2500) faixas['R$ 1.000 - R$ 2.500']++;
        else if (valor < 5000) faixas['R$ 2.500 - R$ 5.000']++;
        else if (valor < 10000) faixas['R$ 5.000 - R$ 10.000']++;
        else if (valor < 50000) faixas['R$ 10.000 - R$ 50.000']++;
        else faixas['R$ 50.000+']++;
    });
    
    return faixas;
}

/**
 * Identifica clientes inativos de alto valor (oportunidades de reativação)
 */
function clientesInativosAltoValor(diasInatividade = 180, valorMinimo = 2000) {
    const hoje = new Date();
    
    return state.clients.filter(client => {
        const valor = parseFloat(client.valorTotal) || 0;
        if (valor < valorMinimo) return false;
        
        if (!client.dataUltimaCompra) return true;
        
        const partes = client.dataUltimaCompra.split('/');
        if (partes.length !== 3) return false;
        
        const dataUltima = new Date(partes[2], partes[1] - 1, partes[0]);
        const diff = Math.floor((hoje - dataUltima) / (1000 * 60 * 60 * 24));
        
        return diff >= diasInatividade;
    });
}

/**
 * Identifica clientes que compraram recentemente
 */
function clientesAtivosRecentes(dias = 30) {
    const hoje = new Date();
    
    return state.clients.filter(client => {
        if (!client.dataUltimaCompra) return false;
        
        const partes = client.dataUltimaCompra.split('/');
        if (partes.length !== 3) return false;
        
        const dataUltima = new Date(partes[2], partes[1] - 1, partes[0]);
        const diff = Math.floor((hoje - dataUltima) / (1000 * 60 * 60 * 24));
        
        return diff <= dias;
    });
}

/**
 * Calcula estatísticas completas
 */
function calcularEstatisticasFinanceiras() {
    const clients = state.clients;
    
    const totalVendas = calcularTotalVendas(clients);
    const ticketMedio = calcularTicketMedio(clients);
    const maiorCompra = encontrarMaiorCompra(clients);
    const menorCompra = encontrarMenorCompra(clients);
    
    const clientesVIP = contarClientesVIP(5000);
    const clientesPremium = contarClientesVIP(10000);
    const clientesElite = contarClientesVIP(50000);
    
    const distribuicao = distribuicaoPorFaixa(clients);
    const inativosAltoValor = clientesInativosAltoValor(180, 2000);
    const ativosRecentes = clientesAtivosRecentes(30);
    
    return {
        totalVendas,
        ticketMedio,
        maiorCompra,
        menorCompra,
        clientesVIP,
        clientesPremium,
        clientesElite,
        distribuicao,
        inativosAltoValor: inativosAltoValor.length,
        ativosRecentes: ativosRecentes.length
    };
}

// ==========================================
// FORMATAÇÃO
// ==========================================

/**
 * Formata valor monetário
 */
function formatarMoeda(valor) {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numero);
}

/**
 * Formata número com separadores
 */
function formatarNumero(valor) {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

/**
 * Parse de moeda (converte R$ 1.234,56 para 1234.56)
 */
function parseMoeda(valorStr) {
    if (typeof valorStr === 'number') return valorStr;
    if (!valorStr) return 0;
    
    // Remove R$, espaços, e pontos de milhar
    const limpo = valorStr.toString()
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');
    
    return parseFloat(limpo) || 0;
}

// ==========================================
// EXPORTAÇÕES
// ==========================================

/**
 * Exporta clientes com valor (CSV)
 */
function exportarComValor(clients, tipo = 'completo') {
    let csv = '';
    let filename = '';
    
    switch(tipo) {
        case 'whatsapp-valor':
            csv = 'nome,telefone,valor\n';
            clients.forEach(c => {
                const valor = formatarMoeda(c.valorTotal || 0);
                csv += `${c.nome},${c.telefone},${valor}\n`;
            });
            filename = `clientes_whatsapp_valor_${new Date().toISOString().split('T')[0]}.csv`;
            break;
            
        case 'email-valor':
            csv = 'nome,email,valor\n';
            clients.forEach(c => {
                const valor = formatarMoeda(c.valorTotal || 0);
                csv += `${c.nome},${c.email || ''},${valor}\n`;
            });
            filename = `clientes_email_valor_${new Date().toISOString().split('T')[0]}.csv`;
            break;
            
        case 'completo':
        default:
            csv = 'nome,telefone,email,cpf,estado,cidade,valorTotal,categoria\n';
            clients.forEach(c => {
                const valor = formatarMoeda(c.valorTotal || 0);
                const categoria = nomeCategoria(classificarCliente(c.valorTotal));
                csv += `${c.nome},${c.telefone},${c.email || ''},${c.cpf || ''},${c.estado || ''},${c.cidade || ''},${valor},${categoria}\n`;
            });
            filename = `clientes_completo_${new Date().toISOString().split('T')[0]}.csv`;
            break;
    }
    
    baixarCSV(csv, filename);
}

/**
 * Exporta ranking de top clientes
 */
function exportarRanking(n = 10) {
    const topClientes = getTopClientes(n);
    
    let csv = 'posicao,nome,telefone,email,valor,categoria\n';
    topClientes.forEach((client, index) => {
        const valor = formatarMoeda(client.valorTotal || 0);
        const categoria = nomeCategoria(classificarCliente(client.valorTotal));
        csv += `${index + 1},${client.nome},${client.telefone},${client.email || ''},${valor},${categoria}\n`;
    });
    
    const filename = `top_${n}_clientes_${new Date().toISOString().split('T')[0]}.csv`;
    baixarCSV(csv, filename);
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Baixa CSV
 */
function baixarCSV(conteudo, filename) {
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Exporta funções para uso global
window.FinanceiroModule = {
    calcularTotalVendas,
    calcularTicketMedio,
    encontrarMaiorCompra,
    encontrarMenorCompra,
    contarClientesVIP,
    classificarCliente,
    corCategoria,
    nomeCategoria,
    getTopClientes,
    ordenarPorValor,
    filtrarPorValor,
    filtrarPorCategoria,
    distribuicaoPorFaixa,
    clientesInativosAltoValor,
    clientesAtivosRecentes,
    calcularEstatisticasFinanceiras,
    formatarMoeda,
    formatarNumero,
    parseMoeda,
    exportarComValor,
    exportarRanking
};

console.log('✅ Módulo Financeiro carregado');
