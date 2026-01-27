# Apoiotec Informática - Sistema de Gestão de Assistência Técnica

## Overview
Apoiotec Informática is a comprehensive web application designed to manage technical assistance operations. Its core purpose is to streamline client management, service call tracking, quotation generation, and financial transactions. The system aims to provide a modern, efficient solution for technical assistance businesses, enhancing operational efficiency and customer service.

## User Preferences
Preferred communication style: Simple, everyday language.
Cost concern: User is concerned about costs for multiple iterations and expects complete, working solutions.

## System Architecture

### UI/UX Decisions
The application features a professional business application interface with a consistent blue color scheme (`#2563eb`), accessible components, and a mobile-first responsive design. It includes a collapsible sidebar navigation and supports a dark mode with a vivid green font (`#00ff41`) on a complete black background with dark blue accents (`#1e3a8a`). Card layouts are prominent across modules, displaying key information with clear visual hierarchy.

### Technical Implementations
The system is built with a modern stack:
- **Frontend**: React 18 with TypeScript, using Wouter for routing, Radix UI and shadcn/ui for UI components, Tailwind CSS for styling, TanStack Query for server state management, and React Hook Form with Zod for forms. Vite is used for building.
- **Backend**: Node.js with Express.js for a REST API.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations. Zod schemas are shared between frontend and backend for validation. ESBuild bundles the server.

### Feature Specifications
- **Data Management**: CRUD operations for Clients, Services, Calls, Quotes, Financial Transactions, and Templates.
- **Service Workflow**: Manages service requests from initial call to conversion to service/invoice, including product/material tracking and installment payments.
- **Financial Module**: Tracks income and expenses, supports partial payments, generates receipts and service notes, and provides detailed financial reports.
- **Reporting**: Generates PDF reports for financial movements, quotes, receipts, and service notes, with filtering and custom date range capabilities.
- **Templating System**: A robust system for generating custom PDFs (receipts, quotes, service notes, reports) with dynamic data insertion, company information, and visual customization options (fonts, colors, layouts, margins, images).
- **User Management**: Authentication system with user login/logout and attribution tracking for actions.
- **Data Integrity**: Includes features for filtering out orphaned records and maintaining consistent data across the system.
- **Global Search**: Autocomplete client search is integrated across all relevant modules.

### System Design Choices
- **Shared Schemas**: Zod schemas are used across frontend and backend to ensure type safety and data consistency.
- **RESTful API**: Provides a clear and consistent interface for data interaction.
- **Real-time Data**: TanStack Query manages data fetching and caching, providing a responsive user experience.
- **Modular Design**: Components and features are designed to be modular and reusable.
- **PDF Generation**: A dedicated, optimized PDF generation module ensures consistent and professional document output, avoiding problematic template variable systems for reliability.
- **Authentication**: Mandatory user login with role-based access to certain data (e.g., user who marked transactions as paid).

## External Dependencies

### Core Dependencies
- `pg`: PostgreSQL client library for Node.js (local database connections).
- `drizzle-orm`: Type-safe ORM for database interactions.
- `drizzle-orm/node-postgres`: Drizzle adapter for PostgreSQL.
- `@tanstack/react-query`: For server state management and data fetching.
- `react-hook-form`: For form handling and validation.
- `zod`: For schema validation across frontend and backend.
- `tailwindcss`: Utility-first CSS framework for styling.
- `bcryptjs`: For password hashing and verification.

### UI Dependencies
- `@radix-ui/*`: Headless UI components for accessible and customizable UI.
- `lucide-react`: Icon library.
- `class-variance-authority`: Utilities for component variants.
- `cmdk`: Command palette component.

## Deployment Status - Ubuntu Server (29 de Novembro 2025)

### ✅ Deployment Completado com Sucesso

#### Ambiente Implantado
- **Server**: Ubuntu Server (Local Infrastructure)
- **Localização**: `/home/aptc/sistemaapoiotec/TechSupportManager/`
- **Porta**: 5000
- **Banco de Dados**: PostgreSQL Local (`apoiotec_db`)

#### Configuração Database
- **Host**: localhost
- **Database**: apoiotec_db
- **User**: apoiotec
- **Password**: senha123
- **Connection String**: `postgresql://apoiotec:senha123@localhost:5432/apoiotec_db`

#### Autenticação Implementada
- **Usuario Admin Padrão**: Criado automaticamente ao iniciar o servidor
- **Username**: admin
- **Password**: admin
- **Hash**: bcryptjs com 10 salt rounds
- **Recurso**: Usuário admin é sempre recriado se não existir (nunca será perdido)

#### Alterações Principais Realizadas
1. **server/index.ts**: Adicionada função `ensureDefaultAdmin()` que:
   - Verifica se usuário admin existe ao iniciar
   - Cria automaticamente com senha "admin" hasheada se não existir
   - Garante que nunca será perdido mesmo com mudanças de banco

2. **server/db.ts**: Alterado de Neon Cloud (WebSocket) para PostgreSQL local:
   - Import: `import 'dotenv/config'` adicionado para carregar variáveis
   - Mudado de `@neondatabase/serverless` para `pg` (PostgreSQL client)
   - Mudado de `drizzle-orm/neon-serverless` para `drizzle-orm/node-postgres`
   - Usa Pool nativo do PostgreSQL para conexões diretas

3. **.env** (Ubuntu):
   ```
   DATABASE_URL="postgresql://apoiotec:senha123@localhost:5432/apoiotec_db"
   NODE_ENV=development
   PORT=5000
   ```

#### Status de Funcionamento
- ✅ Sistema iniciando sem erros
- ✅ Autenticação funcionando (admin/admin)
- ✅ Banco de dados local conectando corretamente
- ✅ Usuário admin persistindo no banco de dados

#### Como Iniciar o Servidor (Ubuntu)
```bash
cd /home/aptc/sistemaapoiotec/TechSupportManager
npm run dev
```

Servidor roda em: http://localhost:5000

#### Credenciais de Acesso
- **Username**: admin
- **Password**: admin

#### Próximas Considerações
- PM2 pode ser implementado para manter o servidor rodando em background (opcional)
- Backup automático do PostgreSQL deve ser configurado para produção
- SSL/HTTPS deve ser configurado para acesso remoto seguro

## Sistema de Ativação por Hardware (02 de Dezembro 2025)

### 🔐 Funcionalidade Implementada
Sistema de **ativação baseado em hardware** que impede uso não autorizado do sistema. Após primeira ativação, o servidor fica permanentemente desbloqueado (a menos que o hardware mude).

### 🔧 Como Funciona
1. **Primeira Ativação**: Ao iniciar pela primeira vez, o sistema pede a **senha mestre** (`Apoiotec1@Informatica`)
2. **Geração de Fingerprint**: O servidor gera um ID único baseado em:
   - Serial do sistema (DMI)
   - MAC Address da placa de rede
   - Serial do disco rígido
   - UUID da partição root
   - Machine ID do Linux
3. **Armazenamento**: Fingerprint é salvo no banco de dados em `system_activation`
4. **Verificações Subsequentes**: A cada acesso, o servidor verifica se o hardware é o mesmo
   - ✅ Se for o mesmo: Permite acesso direto
   - ⚠️ Se mudou: Pede senha mestre novamente (novo servidor ou hardware alterado)

### 📋 Senha Mestre
```
Senha: Apoiotec1@Informatica
Local: Hardcoded em server/routes.ts (linha 19)
Segurança: Não é salva em banco - comparado via bcryptjs
```

### 🛡️ Proteção contra Uso Não Autorizado
- ✅ Cada servidor Ubuntu tem fingerprint único e estável
- ✅ Mesmo que clonem o banco de dados, hardware é diferente
- ✅ Mudanças de disco, placa de rede ou CPU são detectadas
- ✅ Rate limiting: máx 5 tentativas de senha com bloqueio de 30 minutos
- ✅ Histórico de tentativas de ativação registrado

### 📝 Implementação Técnica
- **Arquivo**: `server/utils/hardware-fingerprint.ts`
- **Rota de Ativação**: `POST /api/activation/check` (verifica status)
- **Rota de Validação**: `POST /api/activation/activate` (valida senha)
- **Tabela DB**: `system_activation` (armazena fingerprint e status)
- **Compatibilidade**: Ubuntu, Debian, CentOS, Rocky Linux (qualquer distro com `/sys` filesystem)

### ✅ Status Atual
- Sistema funciona **100% em produção Linux**
- Fingerprint é **estável entre reinicializações**
- Pronto para exportação ao Ubuntu Server
- Sem dependência de ambiente Replit

## Sistema de Assinatura Digital (10 de Dezembro 2025)

### 🔏 Funcionalidade Implementada
Sistema de **assinatura digital de PDFs** usando certificados A1 (arquivo .pfx). Permite assinar digitalmente:
- Orçamentos
- Notas de Serviço
- Recibos

### 🔧 Como Funciona
1. **Upload de Certificado**: Usuário faz upload do certificado A1 (.pfx) na página Certificados Digitais
2. **Teste de Certificado**: Sistema valida o certificado e extrai informações (nome, CNPJ, validade)
3. **Geração de PDF**: Ao gerar qualquer PDF, o sistema pergunta se deseja assinar
4. **Senha do Certificado**: Usuário digita a senha do certificado (não é armazenada)
5. **Assinatura**: PDF é assinado digitalmente com marca visual

### 📋 Segurança
```
- Senha do certificado: Solicitada a cada assinatura, NUNCA armazenada
- Limite de tentativas: Máximo 2 tentativas erradas
- Bloqueio temporário: 3 minutos após falhar 2 vezes
- Aviso de expiração: 30 dias antes de vencer
- Bloqueio automático: Certificados expirados são bloqueados
```

### 🛡️ Recursos de Segurança
- ✅ Log de auditoria de todas as assinaturas (sucesso e falha)
- ✅ Aviso no Dashboard quando certificado está expirando
- ✅ Marca visual da assinatura no PDF (canto inferior esquerdo)
- ✅ Validação de integridade do certificado antes de usar

### 📝 Implementação Técnica
- **Arquivo Backend**: `server/utils/digital-signature.ts`
- **Rotas de Certificados**: `GET/POST/DELETE /api/digital-certificates`
- **Rota de Assinatura**: `POST /api/digital-signature/sign`
- **Tabelas DB**: `digital_certificates`, `signature_audit_log`
- **Biblioteca**: `node-signpdf` para assinatura de PDFs

### 📂 Estrutura de Arquivos
- **Certificados**: Armazenados em `/certs/` (usar variável CERT_DIRECTORY)
- **Frontend**: `client/src/pages/digital-certificates.tsx`
- **Modal**: `client/src/components/SignatureModal.tsx`

### ✅ Status Atual
- Sistema pronto para uso em produção
- Integrado em Orçamentos, Notas de Serviço e Recibos
- Dashboard mostra aviso de certificados expirando

