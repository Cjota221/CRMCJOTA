# 📄 Exemplo de Formato CSV para Importação

## Formato Mínimo Obrigatório

```csv
Nome,WhatsApp
João Silva,11999998888
Maria Santos,21988887777
```

## Formato Completo Recomendado

```csv
Nome,WhatsApp,E-mail,CPF,Endereço,Cidade,Estado,Data Nascimento,Última Compra,Total Compras
João Silva,11999998888,joao@email.com,12345678900,Rua A 123,São Paulo,SP,15/03/1985,10/11/2024,5500.50
Maria Santos,21988887777,maria@email.com,98765432100,Av B 456,Rio de Janeiro,RJ,22/07/1990,05/10/2024,3200.00
Pedro Costa,31987776666,pedro@email.com,45678912300,Praça C 789,Belo Horizonte,MG,30/12/1982,15/09/2024,8750.25
```

## Colunas Suportadas

### Obrigatórias
- **Nome** (ou "Nome Cliente", "Cliente", "Razão Social")
- **WhatsApp** (ou "Telefone", "Celular", "Telefone 2")

### Opcionais
- **E-mail** (ou "E-mail")
- **CPF** (ou "CNPJ", "CPF/CNPJ")
- **Endereço** (ou "Endereco", "Endereco1")
- **Cidade**
- **Estado** (ou "UF")
- **Data Nascimento** (ou "Data de Aniversário")
- **Última Compra** (ou "Ultima Compra")
- **Total Compras** (ou "Valor Total", "Total Com")

## Formatos de Data Aceitos

### Brasileiros (preferidos)
- `15/03/1985` (DD/MM/YYYY)
- `15/03/85` (DD/MM/YY)
- `15-03-1985` (DD-MM-YYYY)

### Internacionais
- `1985-03-15` (YYYY-MM-DD)
- `1985/03/15` (YYYY/MM/DD)

## Formatos de Telefone Aceitos

Todos serão normalizados automaticamente:

```
11999998888      → 11999998888
(11) 99999-8888  → 11999998888
+55 11 99999-8888 → 5511999998888
55 11 99999-8888 → 5511999998888
```

## Formatos de Valor Aceitos

```
R$ 5.500,50  → 5500.50
5.500,50     → 5500.50
5500.50      → 5500.50
5500         → 5500.00
```

## Delimitadores Aceitos

O sistema detecta automaticamente:
- **Vírgula** (,) - padrão inglês
- **Ponto e vírgula** (;) - padrão brasileiro

## Dicas para Importação

### ✅ Boas Práticas

1. **Encoding UTF-8**
   - Salve seu CSV em UTF-8 para evitar problemas com acentos
   - Excel: "Salvar Como" > "CSV UTF-8"

2. **Sem Linhas Vazias**
   - Remova linhas em branco
   - Certifique-se que cada linha tem dados

3. **Cabeçalhos Claros**
   - Use nomes simples e claros
   - Evite caracteres especiais nos nomes das colunas

4. **Dados Consistentes**
   - Use o mesmo formato de data em todo arquivo
   - Mantenha padrão de telefone consistente

### ❌ Problemas Comuns

1. **Caracteres Especiais**
   - Problema: Nomes com ã, é, ç aparecem errados
   - Solução: Salvar em UTF-8

2. **Telefones Incompletos**
   - Problema: Telefones com menos de 10 dígitos
   - Solução: Completar com DDD e número

3. **Datas Inválidas**
   - Problema: 32/13/2024
   - Solução: Usar datas válidas (DD/MM/YYYY)

4. **Vírgulas em Nomes**
   - Problema: Silva, João quebra as colunas
   - Solução: Use aspas: "Silva, João"

## Exemplo Excel → CSV

### No Excel:

| Nome | WhatsApp | E-mail | Cidade | Estado |
|------|----------|--------|--------|--------|
| João Silva | 11999998888 | joao@email.com | São Paulo | SP |
| Maria Santos | 21988887777 | maria@email.com | Rio de Janeiro | RJ |

### Salvando:
1. Arquivo > Salvar Como
2. Tipo: "CSV UTF-8 (Delimitado por vírgulas)"
3. Salvar

### Resultado do CSV:
```csv
Nome,WhatsApp,E-mail,Cidade,Estado
João Silva,11999998888,joao@email.com,São Paulo,SP
Maria Santos,21988887777,maria@email.com,Rio de Janeiro,RJ
```

## Template para Download

Crie um arquivo novo com este conteúdo:

```csv
Nome,WhatsApp,E-mail,CPF,Endereço,Cidade,Estado,Data Nascimento,Última Compra,Total Compras
Cliente Exemplo,11999998888,exemplo@email.com,12345678900,Rua Exemplo 123,São Paulo,SP,01/01/1990,01/12/2024,1000.00
```

Salve como `template-importacao.csv` e use como base!

## Teste de Importação

Antes de importar muitos clientes:

1. **Crie um CSV de teste** com 2-3 clientes
2. **Importe no CRM**
3. **Verifique** se os dados aparecem corretamente
4. **Ajuste o formato** se necessário
5. **Importe** o arquivo completo

## Validações Automáticas

O sistema faz automaticamente:

✅ Remove espaços extras
✅ Normaliza telefones
✅ Converte valores monetários
✅ Padroniza datas
✅ Detecta duplicatas por WhatsApp
✅ Atualiza dados existentes
✅ Pula linhas com erros críticos

## Campos Inteligentes

Se o sistema não encontrar a coluna exata, procura alternativas:

### Para Nome:
- Nome
- Nome Cliente
- Cliente
- Destinatário
- Razão Social
- Nome Fantasia

### Para WhatsApp:
- WhatsApp
- Telefone
- Telefone 2
- Celular
- Telefone Principal

### Para E-mail:
- Email
- E-mail
- E mail

### Para Estado:
- Estado
- UF

## Exemplo de Arquivo Grande

Para arquivos com milhares de linhas:

```csv
Nome,WhatsApp,E-mail,Cidade,Estado,Total Compras
Cliente 0001,11999990001,cliente0001@email.com,São Paulo,SP,1500.00
Cliente 0002,11999990002,cliente0002@email.com,São Paulo,SP,2300.00
Cliente 0003,21999990003,cliente0003@email.com,Rio de Janeiro,RJ,890.00
...
Cliente 9999,11999999999,cliente9999@email.com,São Paulo,SP,4200.00
```

**Dica**: O sistema processa arquivos grandes em segundos, mas pode demorar alguns momentos para aparecer na tela.

## Atualização de Dados

Quando você importa um CSV com clientes já existentes:

### O sistema compara por WhatsApp:
- Se o WhatsApp já existe, **atualiza** os dados
- Se o WhatsApp é novo, **adiciona** novo cliente

### Regras de atualização:
- ✅ Última compra mais recente sobrescreve a antiga
- ✅ Campos vazios NÃO sobrescrevem campos preenchidos
- ✅ Campos preenchidos sobrescrevem campos vazios
- ✅ Total de compras é atualizado junto com data

### Exemplo:

**Cliente no Sistema:**
```
Nome: João Silva
WhatsApp: 11999998888
E-mail: (vazio)
Última Compra: 01/01/2024
```

**Importando:**
```csv
Nome,WhatsApp,E-mail,Última Compra
João Silva,11999998888,joao@email.com,15/12/2024
```

**Resultado:**
```
Nome: João Silva
WhatsApp: 11999998888
E-mail: joao@email.com  ← ATUALIZADO
Última Compra: 15/12/2024  ← ATUALIZADO
```

---

**💡 Dica Final**: Sempre mantenha um backup do seu CSV original antes de fazer modificações!
