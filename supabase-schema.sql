-- ==========================================
-- SCHEMA SUPABASE - CRM + FACILZAP
-- ==========================================

-- Executar este SQL no SQL Editor do Supabase

-- ==========================================
-- TABELA: clientes
-- ==========================================

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilzap_id INTEGER UNIQUE,
  
  -- Dados pessoais
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  cpf VARCHAR(14),
  data_nascimento VARCHAR(10),
  
  -- Endereço
  cep VARCHAR(9),
  estado VARCHAR(2),
  cidade VARCHAR(100),
  bairro VARCHAR(100),
  endereco TEXT,
  numero VARCHAR(20),
  complemento VARCHAR(100),
  
  -- Dados comerciais
  valor_total DECIMAL(12,2) DEFAULT 0,
  data_ultima_compra VARCHAR(10),
  categoria VARCHAR(20) DEFAULT 'novo',
  origem VARCHAR(50) DEFAULT 'manual',
  
  -- Tags e observações
  tags TEXT[],
  observacoes TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT clientes_telefone_key UNIQUE (telefone)
);

-- Índices para performance
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_facilzap_id ON clientes(facilzap_id);
CREATE INDEX idx_clientes_categoria ON clientes(categoria);
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_clientes_valor_total ON clientes(valor_total DESC);

-- ==========================================
-- TABELA: pedidos
-- ==========================================

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilzap_id INTEGER UNIQUE,
  codigo VARCHAR(50) NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Dados do pedido
  catalogo_id INTEGER,
  catalogo_nome VARCHAR(255),
  vendedor_id INTEGER,
  vendedor_nome VARCHAR(255),
  data_pedido VARCHAR(10),
  
  -- Valores
  subtotal DECIMAL(12,2),
  valor_frete DECIMAL(12,2),
  desconto DECIMAL(12,2),
  total DECIMAL(12,2) NOT NULL,
  
  -- Pagamento
  forma_pagamento VARCHAR(100),
  parcelas INTEGER DEFAULT 1,
  
  -- Entrega
  forma_entrega VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pendente',
  status_pago BOOLEAN DEFAULT FALSE,
  status_entregue BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  origem VARCHAR(50),
  
  -- Metadados
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_facilzap_id ON pedidos(facilzap_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(data_pedido);

-- ==========================================
-- TABELA: carrinhos_abandonados
-- ==========================================

CREATE TABLE IF NOT EXISTS carrinhos_abandonados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilzap_id UUID UNIQUE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Dados do carrinho
  catalogo_id INTEGER,
  catalogo_nome VARCHAR(255),
  vendedor_id INTEGER,
  vendedor_nome VARCHAR(255),
  
  -- Produtos
  quantidade_produtos INTEGER,
  valor_total DECIMAL(12,2),
  produtos JSONB,
  
  -- Datas
  iniciado_em TIMESTAMP,
  ultima_atualizacao TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ativo',
  convertido BOOLEAN DEFAULT FALSE,
  pedido_id UUID REFERENCES pedidos(id),
  
  -- Follow-up
  tentativas_contato INTEGER DEFAULT 0,
  ultimo_contato TIMESTAMP,
  
  -- Metadados
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_carrinhos_cliente_id ON carrinhos_abandonados(cliente_id);
CREATE INDEX idx_carrinhos_status ON carrinhos_abandonados(status);
CREATE INDEX idx_carrinhos_valor ON carrinhos_abandonados(valor_total DESC);

-- ==========================================
-- TABELA: grupos
-- ==========================================

CREATE TABLE IF NOT EXISTS grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Metadados
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- TABELA: clientes_grupos (relação N-N)
-- ==========================================

CREATE TABLE IF NOT EXISTS clientes_grupos (
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
  adicionado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (cliente_id, grupo_id)
);

-- Índices
CREATE INDEX idx_clientes_grupos_cliente ON clientes_grupos(cliente_id);
CREATE INDEX idx_clientes_grupos_grupo ON clientes_grupos(grupo_id);

-- ==========================================
-- TABELA: tarefas
-- ==========================================

CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  carrinho_id UUID REFERENCES carrinhos_abandonados(id) ON DELETE SET NULL,
  
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  prioridade VARCHAR(20) DEFAULT 'media',
  status VARCHAR(20) DEFAULT 'pendente',
  
  data_vencimento TIMESTAMP,
  concluida_em TIMESTAMP,
  
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tarefas_cliente_id ON tarefas(cliente_id);
CREATE INDEX idx_tarefas_status ON tarefas(status);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);

-- ==========================================
-- TABELA: webhook_logs
-- ==========================================

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID,
  evento VARCHAR(100),
  payload JSONB,
  erro TEXT,
  stack TEXT,
  sucesso BOOLEAN DEFAULT TRUE,
  processado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_logs_evento ON webhook_logs(evento);
CREATE INDEX idx_webhook_logs_sucesso ON webhook_logs(sucesso);
CREATE INDEX idx_webhook_logs_processado ON webhook_logs(processado_em DESC);

-- ==========================================
-- TABELA: configuracoes
-- ==========================================

CREATE TABLE IF NOT EXISTS configuracoes (
  chave VARCHAR(100) PRIMARY KEY,
  valor TEXT,
  descricao TEXT,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('facilzap_api_token', '', 'Token da API do FácilZap'),
  ('facilzap_webhook_ativo', 'true', 'Webhook ativo ou não'),
  ('auto_sync_enabled', 'true', 'Sincronização automática habilitada'),
  ('sync_interval_minutes', '30', 'Intervalo de sincronização em minutos')
ON CONFLICT (chave) DO NOTHING;

-- ==========================================
-- FUNCTIONS E TRIGGERS
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar_em
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carrinhos_updated_at BEFORE UPDATE ON carrinhos_abandonados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON grupos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VIEWS ÚTEIS
-- ==========================================

-- View: Clientes com estatísticas
CREATE OR REPLACE VIEW v_clientes_estatisticas AS
SELECT 
  c.*,
  COUNT(DISTINCT p.id) as total_pedidos,
  COALESCE(SUM(p.total), 0) as total_gasto,
  MAX(p.data_pedido) as ultima_compra_real,
  COUNT(DISTINCT ca.id) as carrinhos_abandonados
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
LEFT JOIN carrinhos_abandonados ca ON c.id = ca.cliente_id AND ca.status = 'ativo'
GROUP BY c.id;

-- View: Dashboard de métricas
CREATE OR REPLACE VIEW v_dashboard_metricas AS
SELECT
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM clientes WHERE categoria = 'vip') as clientes_vip,
  (SELECT COUNT(*) FROM clientes WHERE categoria = 'premium') as clientes_premium,
  (SELECT COUNT(*) FROM clientes WHERE categoria = 'elite') as clientes_elite,
  (SELECT COALESCE(SUM(valor_total), 0) FROM clientes) as total_vendas,
  (SELECT COALESCE(AVG(valor_total), 0) FROM clientes WHERE valor_total > 0) as ticket_medio,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM carrinhos_abandonados WHERE status = 'ativo') as carrinhos_ativos;

-- View: Carrinhos para recuperação
CREATE OR REPLACE VIEW v_carrinhos_recuperacao AS
SELECT 
  ca.*,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  c.email as cliente_email,
  EXTRACT(EPOCH FROM (NOW() - ca.ultima_atualizacao))/3600 as horas_abandonado
FROM carrinhos_abandonados ca
JOIN clientes c ON ca.cliente_id = c.id
WHERE ca.status = 'ativo'
  AND ca.convertido = FALSE
  AND ca.ultima_atualizacao >= NOW() - INTERVAL '7 days'
ORDER BY ca.valor_total DESC;

-- ==========================================
-- RLS (ROW LEVEL SECURITY) - Opcional
-- ==========================================

-- Habilitar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinhos_abandonados ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir tudo para usuários autenticados
CREATE POLICY "Permitir tudo para autenticados" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para autenticados" ON pedidos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para autenticados" ON carrinhos_abandonados
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para autenticados" ON grupos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir tudo para autenticados" ON tarefas
  FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- DADOS DE TESTE (Opcional)
-- ==========================================

-- Inserir cliente de teste
INSERT INTO clientes (
  nome, telefone, email, estado, cidade, valor_total, categoria, origem
) VALUES (
  'Cliente Teste', '11999999999', 'teste@email.com', 'SP', 'São Paulo', 0, 'novo', 'manual'
);

-- ==========================================
-- QUERIES ÚTEIS
-- ==========================================

-- Top 10 clientes por valor
-- SELECT * FROM clientes ORDER BY valor_total DESC LIMIT 10;

-- Clientes VIP
-- SELECT * FROM clientes WHERE categoria IN ('vip', 'premium', 'elite');

-- Carrinhos abandonados últimos 7 dias
-- SELECT * FROM v_carrinhos_recuperacao;

-- Métricas do dashboard
-- SELECT * FROM v_dashboard_metricas;

-- Pedidos de um cliente
-- SELECT * FROM pedidos WHERE cliente_id = 'UUID_AQUI' ORDER BY data_pedido DESC;

-- Logs de webhooks com erro
-- SELECT * FROM webhook_logs WHERE sucesso = FALSE ORDER BY processado_em DESC;
