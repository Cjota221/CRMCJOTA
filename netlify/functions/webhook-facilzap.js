// ==========================================
// WEBHOOK FACILZAP - NETLIFY FUNCTION + SUPABASE
// ==========================================

const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase (usar variáveis de ambiente)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const webhook = JSON.parse(event.body);
    
    console.log('📥 Webhook FácilZap:', {
      id: webhook.id,
      evento: webhook.evento,
      timestamp: new Date().toISOString()
    });

    // Registrar webhook recebido
    await registrarWebhookLog(webhook);

    let resultado;
    
    switch (webhook.evento) {
      case 'pedido_criado':
        resultado = await processarPedidoCriado(webhook);
        break;
        
      case 'pedido_atualizado':
        resultado = await processarPedidoAtualizado(webhook);
        break;
        
      case 'carrinho_abandonado_criado':
        resultado = await processarCarrinhoAbandonado(webhook);
        break;
        
      default:
        console.log('⚠️ Evento não suportado:', webhook.evento);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Evento recebido mas não processado',
            evento: webhook.evento
          })
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        evento: webhook.evento,
        resultado
      })
    };

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Registrar erro no Supabase
    await registrarErro(error, event.body);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// ==========================================
// PROCESSAR PEDIDO CRIADO
// ==========================================

async function processarPedidoCriado(webhook) {
  const { dados } = webhook;
  const clienteData = dados.cliente;
  
  console.log('📦 Processando pedido criado:', dados.codigo);

  // 1. Buscar ou criar cliente
  const cliente = await buscarOuCriarCliente(clienteData);
  
  // 2. Registrar pedido
  const pedido = await registrarPedido(dados, cliente.id);
  
  // 3. Atualizar valor total do cliente
  await atualizarValorTotalCliente(cliente.id, dados.total);
  
  // 4. Atualizar data última compra
  await atualizarDataUltimaCompra(cliente.id, dados.data);
  
  // 5. Reclassificar categoria (VIP/Premium/Elite)
  await reclassificarCliente(cliente.id);
  
  return {
    acao: 'pedido_criado',
    cliente_id: cliente.id,
    pedido_id: pedido.id,
    valor: dados.total
  };
}

// ==========================================
// PROCESSAR PEDIDO ATUALIZADO
// ==========================================

async function processarPedidoAtualizado(webhook) {
  const { dados } = webhook;
  
  console.log('🔄 Processando pedido atualizado:', dados.codigo);

  // Atualizar status do pedido no Supabase
  const { data, error } = await supabase
    .from('pedidos')
    .update({
      status: obterStatusPedido(dados),
      status_pago: dados.status_pago,
      status_entregue: dados.status_entregue,
      status_cancelado: !dados.status,
      atualizado_em: new Date().toISOString()
    })
    .eq('facilzap_id', dados.id)
    .select();

  if (error) throw error;

  // Se foi cancelado, ajustar valor do cliente
  if (!dados.status) {
    await ajustarValorCancelamento(dados.cliente.id, dados.total);
  }

  return {
    acao: 'pedido_atualizado',
    pedido_id: data[0]?.id,
    status: obterStatusPedido(dados)
  };
}

// ==========================================
// PROCESSAR CARRINHO ABANDONADO
// ==========================================

async function processarCarrinhoAbandonado(webhook) {
  const { dados } = webhook;
  const clienteData = dados.cliente;
  
  console.log('🛒 Processando carrinho abandonado:', dados.id);

  // 1. Buscar ou criar cliente
  const cliente = await buscarOuCriarCliente(clienteData);
  
  // 2. Registrar carrinho abandonado
  const { data: carrinho, error } = await supabase
    .from('carrinhos_abandonados')
    .insert({
      facilzap_id: dados.id,
      cliente_id: cliente.id,
      catalogo_id: dados.catalogo.id,
      catalogo_nome: dados.catalogo.nome,
      vendedor_id: dados.vendedor.id,
      vendedor_nome: dados.vendedor.nome,
      quantidade_produtos: dados.quantidade_produtos,
      valor_total: dados.valor_total,
      produtos: dados.produtos,
      iniciado_em: dados.iniciado_em,
      ultima_atualizacao: dados.ultima_atualizacao,
      status: 'ativo'
    })
    .select();

  if (error) throw error;

  // 3. Adicionar tag "carrinho_abandonado"
  await adicionarTagCliente(cliente.id, 'carrinho_abandonado');
  
  // 4. Criar tarefa de follow-up
  await criarTarefaFollowUp(cliente.id, carrinho[0].id, dados.valor_total);

  return {
    acao: 'carrinho_abandonado_criado',
    cliente_id: cliente.id,
    carrinho_id: carrinho[0].id,
    valor: dados.valor_total
  };
}

// ==========================================
// FUNÇÕES AUXILIARES - CLIENTE
// ==========================================

async function buscarOuCriarCliente(clienteData) {
  // Buscar por telefone
  const telefone = formatarTelefone(clienteData.whatsapp_e164 || clienteData.whatsapp);
  
  const { data: clienteExistente } = await supabase
    .from('clientes')
    .select('*')
    .eq('telefone', telefone)
    .single();

  if (clienteExistente) {
    // Atualizar dados
    const { data: clienteAtualizado } = await supabase
      .from('clientes')
      .update({
        nome: clienteData.nome,
        email: clienteData.email,
        cpf: clienteData.cpf_cnpj,
        estado: clienteData.estado,
        cidade: clienteData.cidade,
        cep: clienteData.cep,
        endereco: clienteData.endereco,
        numero: clienteData.numero,
        complemento: clienteData.complemento,
        bairro: clienteData.bairro,
        data_nascimento: formatarData(clienteData.data_nascimento),
        facilzap_id: clienteData.id,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', clienteExistente.id)
      .select()
      .single();

    console.log('✅ Cliente atualizado:', clienteAtualizado.nome);
    return clienteAtualizado;
  } else {
    // Criar novo
    const { data: novoCliente } = await supabase
      .from('clientes')
      .insert({
        facilzap_id: clienteData.id,
        nome: clienteData.nome,
        telefone: telefone,
        email: clienteData.email,
        cpf: clienteData.cpf_cnpj,
        estado: clienteData.estado,
        cidade: clienteData.cidade,
        cep: clienteData.cep,
        endereco: clienteData.endereco,
        numero: clienteData.numero,
        complemento: clienteData.complemento,
        bairro: clienteData.bairro,
        data_nascimento: formatarData(clienteData.data_nascimento),
        origem: 'facilzap',
        valor_total: 0,
        categoria: 'novo'
      })
      .select()
      .single();

    console.log('✅ Cliente criado:', novoCliente.nome);
    return novoCliente;
  }
}

async function atualizarValorTotalCliente(clienteId, valorPedido) {
  // Buscar valor atual
  const { data: cliente } = await supabase
    .from('clientes')
    .select('valor_total')
    .eq('id', clienteId)
    .single();

  const novoTotal = (parseFloat(cliente.valor_total) || 0) + parseFloat(valorPedido);

  await supabase
    .from('clientes')
    .update({ valor_total: novoTotal })
    .eq('id', clienteId);

  console.log(`💰 Valor atualizado: R$ ${novoTotal.toFixed(2)}`);
}

async function atualizarDataUltimaCompra(clienteId, dataCompra) {
  await supabase
    .from('clientes')
    .update({ 
      data_ultima_compra: formatarDataHora(dataCompra)
    })
    .eq('id', clienteId);
}

async function reclassificarCliente(clienteId) {
  const { data: cliente } = await supabase
    .from('clientes')
    .select('valor_total')
    .eq('id', clienteId)
    .single();

  const valor = parseFloat(cliente.valor_total) || 0;
  let categoria = 'novo';

  if (valor >= 50000) categoria = 'elite';
  else if (valor >= 10000) categoria = 'premium';
  else if (valor >= 5000) categoria = 'vip';
  else if (valor > 0) categoria = 'regular';

  await supabase
    .from('clientes')
    .update({ categoria })
    .eq('id', clienteId);

  console.log(`⭐ Categoria atualizada: ${categoria}`);
}

async function ajustarValorCancelamento(facilzapClienteId, valorPedido) {
  // Buscar cliente por facilzap_id
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, valor_total')
    .eq('facilzap_id', facilzapClienteId)
    .single();

  if (cliente) {
    const novoTotal = Math.max(0, parseFloat(cliente.valor_total) - parseFloat(valorPedido));
    
    await supabase
      .from('clientes')
      .update({ valor_total: novoTotal })
      .eq('id', cliente.id);

    console.log(`❌ Pedido cancelado - Valor ajustado: R$ ${novoTotal.toFixed(2)}`);
  }
}

// ==========================================
// FUNÇÕES AUXILIARES - PEDIDO
// ==========================================

async function registrarPedido(dados, clienteId) {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({
      facilzap_id: dados.id,
      codigo: dados.codigo,
      cliente_id: clienteId,
      catalogo_id: dados.catalogo.id,
      catalogo_nome: dados.catalogo.nome,
      vendedor_id: dados.vendedor.id,
      vendedor_nome: dados.vendedor.nome,
      data_pedido: formatarDataHora(dados.data),
      subtotal: dados.subtotal,
      valor_frete: dados.valor_frete,
      desconto: dados.desconto,
      total: dados.total,
      forma_pagamento: dados.pagamentos[0]?.forma_pagamento?.nome,
      parcelas: dados.pagamentos[0]?.parcelas,
      forma_entrega: dados.forma_entrega?.nome,
      status: obterStatusPedido(dados),
      status_pago: dados.status_pago,
      status_entregue: dados.status_entregue,
      observacoes: dados.observacoes,
      origem: dados.origem
    })
    .select()
    .single();

  if (error) throw error;

  console.log('📦 Pedido registrado:', pedido.codigo);
  return pedido;
}

// ==========================================
// FUNÇÕES AUXILIARES - CARRINHO ABANDONADO
// ==========================================

async function adicionarTagCliente(clienteId, tag) {
  const { data: cliente } = await supabase
    .from('clientes')
    .select('tags')
    .eq('id', clienteId)
    .single();

  const tags = cliente.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    
    await supabase
      .from('clientes')
      .update({ tags })
      .eq('id', clienteId);
  }
}

async function criarTarefaFollowUp(clienteId, carrinhoId, valor) {
  await supabase
    .from('tarefas')
    .insert({
      cliente_id: clienteId,
      tipo: 'carrinho_abandonado',
      titulo: `Recuperar carrinho - R$ ${valor.toFixed(2)}`,
      descricao: `Cliente abandonou carrinho com ${valor.toFixed(2)}. Entrar em contato em até 24h.`,
      prioridade: valor >= 500 ? 'alta' : 'media',
      status: 'pendente',
      data_vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      carrinho_id: carrinhoId
    });

  console.log('✅ Tarefa de follow-up criada');
}

// ==========================================
// FUNÇÕES AUXILIARES - LOGS
// ==========================================

async function registrarWebhookLog(webhook) {
  await supabase
    .from('webhook_logs')
    .insert({
      webhook_id: webhook.id,
      evento: webhook.evento,
      payload: webhook,
      processado_em: new Date().toISOString(),
      sucesso: true
    });
}

async function registrarErro(error, payload) {
  try {
    await supabase
      .from('webhook_logs')
      .insert({
        evento: 'erro',
        payload: payload,
        erro: error.message,
        stack: error.stack,
        processado_em: new Date().toISOString(),
        sucesso: false
      });
  } catch (e) {
    console.error('Erro ao registrar log:', e);
  }
}

// ==========================================
// FUNÇÕES AUXILIARES - FORMATAÇÃO
// ==========================================

function formatarTelefone(telefone) {
  if (!telefone) return '';
  if (telefone.startsWith('+55')) return telefone.substring(3);
  return telefone.replace(/\D/g, '');
}

function formatarData(dataStr) {
  if (!dataStr) return null;
  if (dataStr.includes('/')) return dataStr;
  
  try {
    const date = new Date(dataStr);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return null;
  }
}

function formatarDataHora(dataHoraStr) {
  if (!dataHoraStr) return null;
  
  try {
    const partes = dataHoraStr.split(' ');
    const data = partes[0].split('-');
    return `${data[2]}/${data[1]}/${data[0]}`;
  } catch {
    return null;
  }
}

function obterStatusPedido(dados) {
  if (dados.status_entregue) return 'entregue';
  if (dados.status_despachado) return 'despachado';
  if (dados.status_separado) return 'separado';
  if (dados.status_em_separacao) return 'em_separacao';
  if (dados.status_pago) return 'pago';
  if (!dados.status) return 'cancelado';
  return 'pendente';
}
