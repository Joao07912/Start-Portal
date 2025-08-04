# 🔧 Portal Arduino Competition

Portal interno profissional para gerenciamento de competições de Arduino em escolas.

## 🎯 Funcionalidades

### 📊 Dashboard
- Estatísticas em tempo real (escolas, alunos, exercícios, eventos)
- Ranking de escolas por pontuação
- Feed de atividades recentes
- Visão geral do sistema

### 💻 Exercícios Resolvidos
- Biblioteca de exercícios com código Arduino
- Upload de imagens de circuitos
- Categorização por dificuldade
- Visualização completa do código

### 📚 Materiais de Apoio
- Upload e gerenciamento de PDFs
- Guias e documentação técnica
- Download direto dos materiais
- Organização por categorias

### ❓ Quiz Online
- Link direto para quiz externo
- Integração com plataformas de quiz
- Acompanhamento de resultados

### 🏫 Gerenciar Escolas
- Cadastro completo de escolas
- Gerenciamento de alunos por escola
- Sistema de notas e frequência
- Busca rápida por nome da escola
- Substituição completa de planilhas Excel

### 📅 Calendário de Eventos
- Agendamento de visitas às escolas
- Designação de bolsistas responsáveis
- Visualização mensal interativa
- Notificações de eventos próximos

### ⚙️ Administração
- Backup de dados do sistema
- Gerenciamento de usuários
- Configurações gerais
- Relatórios e estatísticas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Hospedagem**: Netlify
- **Design**: CSS Grid, Flexbox, Responsivo
- **Ícones**: Font Awesome 6

## 🎨 Design

- **Paleta de cores**: Inspirada no Arduino (azul #00979D, verde #00A86B)
- **Estilo**: Moderno, técnico, profissional
- **Layout**: Sidebar fixa + conteúdo responsivo
- **Efeitos**: Glass morphism, sombras suaves, animações

## 🚀 Configuração

### 1. Firebase Setup
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Firestore Database
3. Ative Firebase Storage
4. Copie as credenciais para `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};
```

### 2. Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Ajustar conforme necessário
    }
  }
}
```

### 3. Deploy no Netlify
1. Faça upload dos arquivos para o Netlify
2. Configure domínio personalizado (opcional)
3. Ative HTTPS automático

## 📁 Estrutura do Projeto

```
portal-arduino/
├── index.html          # Página principal
├── firebase-config.js  # Configuração Firebase
├── app.js             # Lógica da aplicação
├── README-portal.md   # Documentação
└── assets/            # Imagens e recursos (opcional)
```

## 🔧 Funcionalidades Avançadas

### Sistema de Escolas
- **Cadastro**: Nome, endereço, telefone, email
- **Alunos**: Lista completa com notas e frequência
- **Busca**: Filtro em tempo real por nome
- **Estatísticas**: Número de alunos, pontuação média

### Calendário Inteligente
- **Visualização**: Grade mensal interativa
- **Eventos**: Clique para ver detalhes ou criar novo
- **Bolsistas**: Designação de responsáveis
- **Notificações**: Eventos próximos no dashboard

### Upload de Arquivos
- **Exercícios**: Código + imagem do circuito
- **Materiais**: PDFs, documentos, guias
- **Storage**: Firebase Storage com URLs seguros

## 🔒 Segurança

- Acesso restrito à equipe
- Regras de segurança do Firebase
- Validação de dados no frontend
- Upload seguro de arquivos

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Adaptação automática
- **Mobile**: Menu colapsável, cards empilhados

## 🚀 Próximas Funcionalidades

- [ ] Sistema de autenticação
- [ ] Notificações push
- [ ] Relatórios em PDF
- [ ] API para integração externa
- [ ] Chat interno da equipe
- [ ] Backup automático

## 🤝 Desenvolvimento

Este portal foi desenvolvido focando em:

- **Usabilidade**: Interface intuitiva para a equipe
- **Eficiência**: Substituição completa de planilhas Excel
- **Escalabilidade**: Suporte a crescimento do projeto
- **Manutenibilidade**: Código limpo e documentado

## 📞 Suporte

Para dúvidas ou sugestões sobre o portal, entre em contato com a equipe de desenvolvimento.

---
