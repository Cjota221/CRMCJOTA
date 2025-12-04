# 🚀 Guia Completo: CRM + Supabase + FácilZap

## 📋 Visão Geral da Arquitetura

```
FácilZap → Webhook → Netlify Function → Supabase → CRM Frontend
                                           ↓
                                    Sincronização
                                     Tempo Real
```

### Fluxo de Dados:

1. **Cliente faz pedido** no FácilZap
2. **FácilZap dispara webhook** para Netlify Function
3. **Netlify Function processa** e salva no Supabase
4. **Supabase notifica** CRM em tempo real
5. **CRM atualiza** interface automaticamente

---

## 🎯 Passo 1: Configurar Supabase

### 1.1 Criar Projeto

```
1. Acesse: https://supabase.com
2. Clique "New Project"
3. Nome: CRM-FacilZap
4. Database Password: (anote bem!)
5. Region: South America (São Paulo)
6. Clique "Create new project"
7. Aguarde 2-3 minutos
```

### 1.2 Executar Schema SQL

```
1. No painel lateral, clique "SQL Editor"
2. Clique "+ New query"
3. Copie todo o conteúdo de: supabase-schema.sql
4. Cole no editor
5. Clique "Run" (ou F5)
6. Aguarde mensagem de sucesso
```

### 1.3 Obter Credenciais

```
1. Clique "Settings" (⚙️) no menu lateral
2. Clique "API"
3. Copie:
   - Project URL (https://xxx.supabase.co)
   - anon public key
   - service_role key (para Netlify Function)
```

---

## 🎯 Passo 2: Configurar Netlify

### 2.1 Adicionar Variáveis de Ambiente

```
1. Acesse: https://app.netlify.com
2. Selecione seu site
3. Vá em: Site settings → Environment variables
4. Adicione:

Nome: SUPABASE_URL
Valor: https://seu-projeto.supabase.co

Nome: SUPABASE_SERVICE_KEY
Valor: sua_service_role_key_aqui
```

### 2.2 Instalar Dependências

Crie arquivo `package.json` na raiz:

```json
{
  "name": "crm-facilzap",
  "version": "3.0.0",
  "description": "CRM com integração FácilZap e Supabase",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

### 2.3 Deploy

```bash
cd C:\Users\carol\Desktop\crm-melhorado
git add .
git commit -m "feat: Integração Supabase + FácilZap"
git push origin main
```

---

## 🎯 Passo 3: Atualizar Frontend

### 3.1 Adicionar Scripts no index.html

Adicione antes do `</body>`:

```html
<!-- Supabase Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Nossos módulos -->
<script src="supabase-client.js"></script>
<script>
  // Configurar credenciais
  const SUPABASE_URL = 'https://seu-projeto.supabase.co';
  const SUPABASE_ANON_KEY = 'sua_anon_key_aqui';
</script>
```

### 3.2 Substituir LocalStorage por Supabase

No `app.js`, modificar funções:

```javascript
// ANTES:
function loadDataFromLocalStorage() {
  state.clients = JSON.parse(localStorage.getItem('clients')) || [];
}

// DEPOIS:
async function loadDataFromSupabase() {
  state.clients = await SupabaseModule.buscarClientes();
  renderAll();
}

// ANTES:
function saveToLocalStorage() {
  localStorage.setItem('clients', JSON.stringify(state.clients));
}

// DEPOIS:
async function saveToSupabase(cliente) {
  if (cliente.id) {
    await SupabaseModule.atualizarCliente(cliente.id, cliente);
  } else {
    await SupabaseModule.criarCliente(cliente);
  }
}
```

### 3.3 Habilitar Tempo Real

```javascript
// Escutar mudanças em clientes
SupabaseModule.escutarClientes((payload) => {
  console.log('Cliente atualizado:', payload);
  
  if (payload.eventType === 'INSERT') {
    state.clients.push(payload.new);
  } else if (payload.eventType === 'UPDATE') {
    const index = state.clients.findIndex(c => c.id === payload.new.id);
    if (index !== -1) state.clients[index] = payload.new;
  } else if (payload.eventType === 'DELETE') {
    state.clients = state.clients.filter(c => c.id !== payload.old.id);
  }
  
  renderAll();
});

// Escutar novos pedidos
SupabaseModule.escutarPedidos((payload) => {
  console.log('🔔 Novo pedido!', payload.new);
  mostrarNotificacao(`Novo pedido: ${payload.new.codigo}`);
  loadDataFromSupabase(); // Recarregar dados
});

// Escutar carrinhos abandonados
SupabaseModule.escutarCarrinhosAbandonados((payload) => {
  console.log('🛒 Carrinho abandonado!', payload.new);
  mostrarNotificacao(`Carrinho abandonado: R$ ${payload.new.valor_total}`);
});
```

---

## 🎯 Passo 4: Configurar Webhook FácilZap

### 4.1 Obter URL do Webhook

Após deploy na Netlify, sua URL será:

```
https://seu-site.netlify.app/.netlify/functions/webhook-facilzap
```

### 4.2 Configurar no FácilZap

```
1. Acessar: https://facilzap.com
2. Menu: Integrações → Webhooks
3. Clicar "Novo Webhook"
4. URL: https://seu-site.netlify.app/.netlify/functions/webhook-facilzap
5. Ativar eventos:
   ✅ pedido_criado
   ✅ pedido_atualizado
   ✅ carrinho_abandonado_criado
6. Salvar
```

### 4.3 Testar Webhook

```
1. Fazer um pedido TESTE no FácilZap
2. Verificar logs na Netlify:
   Site → Functions → webhook-facilzap → Logs
3. Verificar cliente criado no Supabase:
   Supabase → Table Editor → clientes
4. Verificar cliente aparece no CRM
```

---

## 🎯 Passo 5: Validação Final

### Checklist:

- [ ] ✅ Projeto Supabase criado
- [ ] ✅ Schema SQL executado
- [ ] ✅ Tabelas criadas (verificar Table Editor)
- [ ] ✅ Variáveis de ambiente no Netlify
- [ ] ✅ package.json criado
- [ ] ✅ Deploy realizado
- [ ] ✅ Supabase Client carregando no frontend
- [ ] ✅ Webhook configurado no FácilZap
- [ ] ✅ Pedido teste criado
- [ ] ✅ Cliente aparece no Supabase
- [ ] ✅ Cliente aparece no CRM
- [ ] ✅ Tempo real funcionando

---

## 📊 Funcionalidades Após Integração

### O que funciona automaticamente:

#### 📦 Quando cliente faz pedido:
```
1. Webhook chega
2. Cliente criado/atualizado no Supabase
3. Pedido registrado
4. Valor somado ao total
5. Data última compra atualizada
6. Categoria reclassificada (VIP/Premium/Elite)
7. CRM atualiza em tempo real
8. Notificação exibida
```

#### 🛒 Quando cliente abandona carrinho:
```
1. Webhook chega
2. Cliente criado/atualizado
3. Carrinho registrado
4. Tag "carrinho_abandonado" adicionada
5. Tarefa de follow-up criada
6. CRM notifica sobre oportunidade
7. Aparece em lista de recuperação
```

#### 🔄 Sincronização Multi-dispositivo:
```
1. Abrir CRM no desktop
2. Abrir CRM no celular
3. Fazer pedido no FácilZap
4. Ambos dispositivos atualizam automaticamente
5. Sem refresh manual necessário
```

---

## 🔧 Comandos Úteis

### Verificar Logs Netlify:
```bash
# Via CLI (se instalado)
netlify logs

# Ou no navegador:
# Site → Functions → webhook-facilzap → Logs
```

### Executar Queries no Supabase:
```sql
-- Ver últimos webhooks recebidos
SELECT * FROM webhook_logs 
ORDER BY processado_em DESC 
LIMIT 10;

-- Ver clientes do FácilZap
SELECT * FROM clientes 
WHERE origem = 'facilzap';

-- Ver carrinhos abandonados
SELECT * FROM v_carrinhos_recuperacao;

-- Ver métricas
SELECT * FROM v_dashboard_metricas;
```

### Testar Webhook Manualmente:
```bash
# PowerShell
$body = @{
  evento = "pedido_criado"
  dados = @{
    id = 123
    codigo = "TEST123"
    total = 100.00
    cliente = @{
      id = 1
      nome = "Teste"
      whatsapp_e164 = "+5511999999999"
      email = "teste@email.com"
    }
    data = "2025-12-04 10:00:00"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Post `
  -Uri "https://seu-site.netlify.app/.netlify/functions/webhook-facilzap" `
  -Body $body `
  -ContentType "application/json"
```

---

## 🐛 Troubleshooting

### Webhook não funciona:

**Verificar:**
```
1. URL está correta?
2. Variáveis de ambiente no Netlify?
3. Logs Netlify mostram erro?
4. Supabase aceita conexão?
5. Service key está correta?
```

**Solução:**
```bash
# Ver logs específicos
netlify logs --function webhook-facilzap

# Testar conexão Supabase
# No console do navegador:
await SupabaseModule.buscarClientes()
```

### Cliente não aparece no CRM:

**Verificar:**
```
1. Cliente está no Supabase?
   Supabase → Table Editor → clientes
2. Frontend carrega do Supabase?
   Console: await SupabaseModule.buscarClientes()
3. Tempo real habilitado?
   Ver subscriptions ativas
```

### Pedido não atualiza valor:

**Verificar:**
```sql
-- No SQL Editor do Supabase
SELECT * FROM pedidos WHERE codigo = 'CODIGO_PEDIDO';
SELECT * FROM clientes WHERE id = 'ID_CLIENTE';
```

**Recalcular valor:**
```sql
-- Recalcular valor total de um cliente
UPDATE clientes 
SET valor_total = (
  SELECT COALESCE(SUM(total), 0) 
  FROM pedidos 
  WHERE cliente_id = clientes.id
)
WHERE id = 'ID_CLIENTE';
```

---

## 📈 Próximos Passos

### Funcionalidades Adicionais:

1. **Dashboard de Recuperação**
   - Lista de carrinhos abandonados
   - Botão "Enviar WhatsApp"
   - Status de follow-up

2. **Automações**
   - Após 1h: WhatsApp automático
   - Após 24h: Desconto de 10%
   - Após 3 dias: Última tentativa

3. **Relatórios Avançados**
   - Taxa de conversão carrinho
   - Clientes por canal
   - Valor médio por origem
   - Crescimento mensal

4. **Integração API FácilZap**
   - Sincronização bidirecional
   - Buscar pedidos históricos
   - Atualizar cliente no FácilZap

---

## 📞 Suporte

**Supabase:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Netlify:**
- Docs: https://docs.netlify.com
- Support: https://www.netlify.com/support/

**FácilZap:**
- Docs: https://docs.facilzap.com
- Suporte: contato@facilzap.com

---

## ✅ Arquivos Criados

1. ✅ `netlify/functions/webhook-facilzap.js` - Function serverless
2. ✅ `supabase-schema.sql` - Schema do banco
3. ✅ `supabase-client.js` - Cliente frontend
4. ✅ `INTEGRACAO-FACILZAP.md` - Documentação
5. ✅ `SETUP-SUPABASE.md` - Este arquivo
6. ✅ `package.json` - Dependências

---

**Pronto! Integração completa CRM + Supabase + FácilZap! 🚀**

**Benefícios:**
- ✅ Dados persistentes (não perde mais!)
- ✅ Multi-dispositivo sincronizado
- ✅ Tempo real automático
- ✅ Escalável (milhares de clientes)
- ✅ Backup automático
- ✅ Queries SQL poderosas
- ✅ Webhooks profissionais

**Custo:**
- Supabase: Grátis até 500MB / 2GB transfer
- Netlify: Grátis até 100GB bandwidth
- FácilZap: Conforme plano
