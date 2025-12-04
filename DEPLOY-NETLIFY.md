# 🚀 Guia Completo: Deploy na Netlify

Este guia mostra como colocar seu CRM online na Netlify em poucos minutos.

## 📋 Pré-requisitos

- ✅ Conta no GitHub (gratuita)
- ✅ Conta na Netlify (gratuita)
- ✅ Git instalado no computador

## 🎯 Visão Geral

```
Seu Computador → GitHub → Netlify → Site Online
```

**Tempo estimado**: 10-15 minutos

---

## 📦 Passo 1: Preparar Arquivos

### 1.1. Organizar Estrutura

Certifique-se que sua pasta tenha esta estrutura:

```
crm-melhorado/
├── index.html
├── styles.css
├── app.js
├── netlify.toml
├── .gitignore
├── template-importacao.csv
├── README-GITHUB.md
└── [outros arquivos .md]
```

### 1.2. Renomear README

Renomeie o arquivo para que o GitHub o reconheça:

```powershell
# No diretório crm-melhorado
Rename-Item -Path "README-GITHUB.md" -NewName "README.md"
```

---

## 🔄 Passo 2: Enviar para GitHub

### 2.1. Inicializar Git (se necessário)

Se você ainda não tem Git configurado no projeto:

```powershell
# Navegue até a pasta do projeto
cd C:\caminho\para\crm-melhorado

# Inicializar repositório
git init

# Configurar seu nome e e-mail (apenas primeira vez)
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"
```

### 2.2. Adicionar Arquivos

```powershell
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status
```

Você deve ver algo como:
```
Changes to be committed:
  new file:   .gitignore
  new file:   index.html
  new file:   styles.css
  new file:   app.js
  new file:   netlify.toml
  ...
```

### 2.3. Fazer Commit

```powershell
# Criar commit com mensagem descritiva
git commit -m "Deploy: CRM organizado com seleção em massa e múltiplos exports"
```

### 2.4. Conectar ao GitHub

```powershell
# Conectar ao repositório remoto
git remote add origin https://github.com/Cjota221/CRMCJOTA.git

# Verificar conexão
git remote -v
```

Você deve ver:
```
origin  https://github.com/Cjota221/CRMCJOTA.git (fetch)
origin  https://github.com/Cjota221/CRMCJOTA.git (push)
```

### 2.5. Enviar para GitHub

```powershell
# Enviar código para o GitHub
git push -u origin main
```

Ou se sua branch for `master`:

```powershell
git push -u origin master
```

**Se pedir credenciais:**
- Use seu token de acesso pessoal do GitHub (não a senha)
- [Como criar token](https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## 🌐 Passo 3: Configurar Netlify

### 3.1. Acessar Netlify

1. Acesse: https://app.netlify.com
2. Faça login com GitHub (ou crie conta gratuita)

### 3.2. Novo Site do Git

1. Clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **"Deploy with GitHub"**
3. Autorize o Netlify a acessar seus repositórios (se for primeira vez)

### 3.3. Selecionar Repositório

1. Busque: `CRMCJOTA`
2. Clique no repositório
3. Clique em **"Configure and deploy"**

### 3.4. Configurações de Build

A Netlify detectará automaticamente o arquivo `netlify.toml`, mas verifique:

```
Branch to deploy: main (ou master)
Base directory: (deixe vazio)
Build command: (deixe vazio)
Publish directory: . (ponto)
```

### 3.5. Deploy!

1. Clique em **"Deploy site"**
2. Aguarde 30-60 segundos
3. Pronto! 🎉

---

## ✅ Passo 4: Verificar Deploy

### 4.1. Acessar Site

Após o deploy, você verá:

```
Site is live: https://random-name-12345.netlify.app
```

1. Clique no link
2. Verifique se o CRM carregou corretamente
3. Teste importar CSV
4. Teste exportações

### 4.2. Customizar Nome

Por padrão, a Netlify gera um nome aleatório. Para personalizar:

1. No painel da Netlify, vá em **"Site settings"**
2. Clique em **"Change site name"**
3. Escolha: `crm-cjota` (ou o que preferir)
4. Seu site ficará: `https://crm-cjota.netlify.app`

### 4.3. Domínio Próprio (Opcional)

Se você tem um domínio (ex: `meucrm.com`):

1. Vá em **"Domain settings"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio
4. Configure os DNS conforme instruções
5. Aguarde propagação (até 48h)

---

## 🔄 Atualizações Futuras

### Como Atualizar o Site

Sempre que você fizer mudanças no código:

```powershell
# 1. Verificar mudanças
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit
git commit -m "Descrição da mudança"

# 4. Enviar para GitHub
git push

# 5. Netlify atualiza automaticamente! 🎉
```

**A Netlify faz deploy automático em 1-2 minutos após o push!**

---

## 🆘 Problemas Comuns

### ❌ Erro: "Permission denied" ao fazer push

**Solução**: Use Token de Acesso Pessoal

```powershell
# 1. Criar token no GitHub:
# https://github.com/settings/tokens
# Permissions: repo (marque todas)

# 2. Ao fazer push, usar:
Username: Cjota221
Password: [seu-token-aqui]

# 3. Ou configurar credencial permanente:
git config credential.helper store
git push
```

### ❌ Site mostra página em branco

**Possíveis causas**:

1. **Erro no JavaScript**:
   - Abra DevTools (F12)
   - Vá em "Console"
   - Veja erros

2. **Arquivos com caminho errado**:
   - Verifique se `index.html` está na raiz
   - Links de CSS/JS devem ser relativos

### ❌ "Branch not found: main"

**Solução**: Sua branch pode ser `master`

```powershell
# Verificar nome da branch
git branch

# Se for master:
git push -u origin master
```

### ❌ Deploy falhou na Netlify

**Solução**: Verificar logs

1. Na Netlify, vá em **"Deploys"**
2. Clique no deploy com erro
3. Veja **"Deploy log"**
4. Procure mensagens de erro em vermelho

---

## 🎯 Checklist Final

Antes de compartilhar seu CRM online:

- [ ] Site carrega sem erros
- [ ] Importação de CSV funciona
- [ ] Seleção em massa funciona
- [ ] Exportação WhatsApp funciona
- [ ] Exportação E-mail funciona
- [ ] Exportação Completa funciona
- [ ] Dashboard exibe métricas
- [ ] Filtros funcionam
- [ ] Grupos funcionam
- [ ] Design responsivo (teste no mobile)
- [ ] LocalStorage salva dados

---

## 🚀 Recursos Adicionais

### Badge de Status

Adicione ao README para mostrar status do deploy:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/SEU-SITE-ID/deploy-status)](https://app.netlify.com/sites/SEU-SITE/deploys)
```

Para encontrar o badge:
1. Netlify → Site settings
2. General → Status badges
3. Copie o código Markdown

### Variáveis de Ambiente

Se no futuro você adicionar APIs:

1. Netlify → Site settings
2. Build & deploy → Environment
3. Adicione variáveis necessárias

### Notificações de Deploy

Configure notificações:

1. Site settings → Build & deploy
2. Deploy notifications
3. Adicione webhook Slack/Discord ou e-mail

---

## 📊 Monitoramento

### Analytics da Netlify (Grátis)

1. Site settings → Analytics
2. Enable analytics
3. Veja visitas, páginas mais acessadas, etc.

### Google Analytics (Opcional)

Adicione ao `index.html` antes do `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🎉 Parabéns!

Seu CRM está online e profissional! 🚀

**Próximos passos sugeridos**:

1. Compartilhe com sua equipe
2. Importe sua base de clientes
3. Crie primeiras campanhas
4. Monitore resultados
5. Sugira melhorias

**Recursos úteis**:

- 📖 [Documentação Netlify](https://docs.netlify.com)
- 💬 [Comunidade Netlify](https://answers.netlify.com)
- 🎓 [Tutoriais Netlify](https://www.netlify.com/blog/)

---

**Dúvidas? Consulte os outros guias:**

- [📚 INDICE.md](INDICE.md) - Índice completo
- [🆘 PROBLEMAS-E-SOLUCOES.md](PROBLEMAS-E-SOLUCOES.md) - Troubleshooting
- [📖 README.md](README.md) - Documentação técnica

---

**Feito com ❤️ | Bom deploy! 🚀**
