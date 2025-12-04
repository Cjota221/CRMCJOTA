// ==========================================
// SUPABASE CLIENT - CRM FRONTEND
// ==========================================

/**
 * Módulo de integração com Supabase
 * Sincronização em tempo real entre CRM e banco de dados
 */

// Importar Supabase (adicionar no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>)
const { createClient } = supabase;

// Configuração (substituir pelas suas credenciais)
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';

// Cliente Supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// CLIENTES
// ==========================================

/**
 * Buscar todos os clientes
 */
async function buscarClientes(filtros = {}) {
  let query = supabaseClient
    .from('clientes')
    .select('*')
    .order('nome', { ascending: true });

  // Aplicar filtros
  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }

  if (filtros.categoria) {
    query = query.eq('categoria', filtros.categoria);
  }

  if (filtros.valorMinimo) {
    query = query.gte('valor_total', filtros.valorMinimo);
  }

  if (filtros.valorMaximo) {
    query = query.lte('valor_total', filtros.valorMaximo);
  }

  if (filtros.busca) {
    query = query.or(`nome.ilike.%${filtros.busca}%,telefone.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }

  return data;
}

/**
 * Criar novo cliente
 */
async function criarCliente(clienteData) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .insert(clienteData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }

  console.log('✅ Cliente criado:', data.nome);
  return data;
}

/**
 * Atualizar cliente
 */
async function atualizarCliente(clienteId, updates) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .update(updates)
    .eq('id', clienteId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }

  console.log('✅ Cliente atualizado:', data.nome);
  return data;
}

/**
 * Deletar cliente
 */
async function deletarCliente(clienteId) {
  const { error } = await supabaseClient
    .from('clientes')
    .delete()
    .eq('id', clienteId);

  if (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }

  console.log('✅ Cliente deletado');
}

/**
 * Buscar cliente por telefone
 */
async function buscarClientePorTelefone(telefone) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .select('*')
    .eq('telefone', telefone)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }

  return data;
}

// ==========================================
// PEDIDOS
// ==========================================

/**
 * Buscar pedidos de um cliente
 */
async function buscarPedidosCliente(clienteId) {
  const { data, error } = await supabaseClient
    .from('pedidos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data_pedido', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }

  return data;
}

/**
 * Buscar todos os pedidos
 */
async function buscarPedidos(filtros = {}) {
  let query = supabaseClient
    .from('pedidos')
    .select('*, clientes(nome, telefone)')
    .order('data_pedido', { ascending: false });

  if (filtros.status) {
    query = query.eq('status', filtros.status);
  }

  if (filtros.dataInicio) {
    query = query.gte('data_pedido', filtros.dataInicio);
  }

  if (filtros.dataFim) {
    query = query.lte('data_pedido', filtros.dataFim);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }

  return data;
}

// ==========================================
// CARRINHOS ABANDONADOS
// ==========================================

/**
 * Buscar carrinhos abandonados ativos
 */
async function buscarCarrinhosAbandonados() {
  const { data, error } = await supabaseClient
    .from('carrinhos_abandonados')
    .select('*, clientes(nome, telefone, email)')
    .eq('status', 'ativo')
    .eq('convertido', false)
    .order('valor_total', { ascending: false });

  if (error) {
    console.error('Erro ao buscar carrinhos:', error);
    throw error;
  }

  return data;
}

/**
 * Marcar carrinho como contatado
 */
async function marcarCarrinhoContatado(carrinhoId) {
  const { data, error } = await supabaseClient
    .from('carrinhos_abandonados')
    .update({
      tentativas_contato: supabaseClient.sql`tentativas_contato + 1`,
      ultimo_contato: new Date().toISOString()
    })
    .eq('id', carrinhoId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar carrinho:', error);
    throw error;
  }

  return data;
}

/**
 * Marcar carrinho como convertido
 */
async function marcarCarrinhoConvertido(carrinhoId, pedidoId) {
  const { data, error } = await supabaseClient
    .from('carrinhos_abandonados')
    .update({
      convertido: true,
      status: 'convertido',
      pedido_id: pedidoId
    })
    .eq('id', carrinhoId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao converter carrinho:', error);
    throw error;
  }

  console.log('✅ Carrinho convertido em pedido');
  return data;
}

// ==========================================
// GRUPOS
// ==========================================

/**
 * Buscar todos os grupos
 */
async function buscarGrupos() {
  const { data, error } = await supabaseClient
    .from('grupos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar grupos:', error);
    throw error;
  }

  return data;
}

/**
 * Criar novo grupo
 */
async function criarGrupo(nome, descricao = '', cor = '#3B82F6') {
  const { data, error } = await supabaseClient
    .from('grupos')
    .insert({ nome, descricao, cor })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar grupo:', error);
    throw error;
  }

  console.log('✅ Grupo criado:', data.nome);
  return data;
}

/**
 * Adicionar cliente ao grupo
 */
async function adicionarClienteAoGrupo(clienteId, grupoId) {
  const { data, error } = await supabaseClient
    .from('clientes_grupos')
    .insert({ cliente_id: clienteId, grupo_id: grupoId });

  if (error && error.code !== '23505') { // 23505 = duplicate key
    console.error('Erro ao adicionar cliente ao grupo:', error);
    throw error;
  }

  console.log('✅ Cliente adicionado ao grupo');
  return data;
}

/**
 * Buscar clientes de um grupo
 */
async function buscarClientesDoGrupo(grupoId) {
  const { data, error } = await supabaseClient
    .from('clientes_grupos')
    .select('clientes(*)')
    .eq('grupo_id', grupoId);

  if (error) {
    console.error('Erro ao buscar clientes do grupo:', error);
    throw error;
  }

  return data.map(item => item.clientes);
}

// ==========================================
// TAREFAS
// ==========================================

/**
 * Buscar tarefas pendentes
 */
async function buscarTarefasPendentes() {
  const { data, error } = await supabaseClient
    .from('tarefas')
    .select('*, clientes(nome, telefone)')
    .eq('status', 'pendente')
    .order('data_vencimento', { ascending: true });

  if (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }

  return data;
}

/**
 * Marcar tarefa como concluída
 */
async function concluirTarefa(tarefaId) {
  const { data, error } = await supabaseClient
    .from('tarefas')
    .update({
      status: 'concluida',
      concluida_em: new Date().toISOString()
    })
    .eq('id', tarefaId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao concluir tarefa:', error);
    throw error;
  }

  console.log('✅ Tarefa concluída');
  return data;
}

// ==========================================
// DASHBOARD E ESTATÍSTICAS
// ==========================================

/**
 * Buscar métricas do dashboard
 */
async function buscarMetricasDashboard() {
  const { data, error } = await supabaseClient
    .from('v_dashboard_metricas')
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }

  return data;
}

/**
 * Buscar top clientes
 */
async function buscarTopClientes(limite = 10) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .select('*')
    .order('valor_total', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Erro ao buscar top clientes:', error);
    throw error;
  }

  return data;
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

/**
 * Escutar mudanças em clientes em tempo real
 */
function escutarClientes(callback) {
  const subscription = supabaseClient
    .channel('clientes-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clientes' },
      (payload) => {
        console.log('🔔 Cliente atualizado:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Escutar novos pedidos em tempo real
 */
function escutarPedidos(callback) {
  const subscription = supabaseClient
    .channel('pedidos-changes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pedidos' },
      (payload) => {
        console.log('🔔 Novo pedido:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Escutar carrinhos abandonados em tempo real
 */
function escutarCarrinhosAbandonados(callback) {
  const subscription = supabaseClient
    .channel('carrinhos-changes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'carrinhos_abandonados' },
      (payload) => {
        console.log('🔔 Carrinho abandonado:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

// ==========================================
// IMPORTAÇÃO EM MASSA
// ==========================================

/**
 * Importar múltiplos clientes de uma vez
 */
async function importarClientesEmMassa(clientes) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .insert(clientes)
    .select();

  if (error) {
    console.error('Erro ao importar clientes:', error);
    throw error;
  }

  console.log(`✅ ${data.length} clientes importados`);
  return data;
}

// ==========================================
// EXPORTAÇÕES
// ==========================================

window.SupabaseModule = {
  // Clientes
  buscarClientes,
  criarCliente,
  atualizarCliente,
  deletarCliente,
  buscarClientePorTelefone,
  
  // Pedidos
  buscarPedidosCliente,
  buscarPedidos,
  
  // Carrinhos
  buscarCarrinhosAbandonados,
  marcarCarrinhoContatado,
  marcarCarrinhoConvertido,
  
  // Grupos
  buscarGrupos,
  criarGrupo,
  adicionarClienteAoGrupo,
  buscarClientesDoGrupo,
  
  // Tarefas
  buscarTarefasPendentes,
  concluirTarefa,
  
  // Dashboard
  buscarMetricasDashboard,
  buscarTopClientes,
  
  // Realtime
  escutarClientes,
  escutarPedidos,
  escutarCarrinhosAbandonados,
  
  // Importação
  importarClientesEmMassa,
  
  // Cliente direto
  client: supabaseClient
};

console.log('✅ Supabase Module carregado');
