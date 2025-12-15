# API de Agendamento do Salão de Beleza

Esta API permite registrar, logar e consultar usuários, além de agendar horários para serviços em um salão de beleza. Documentação disponível via Swagger.

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```cmd
   npm install express swagger-ui-express swagger-jsdoc jsonwebtoken
   ```

## Executando a API REST

- Para iniciar o servidor:
  ```cmd
  node server.js
  ```
- Para importar o app em testes:
  ```js
  const app = require('./app');
  ```

- **Endpoints:**

- `POST /usuario/registrarUsuario` - Registra novo usuário
- `POST /usuario/logarUsuario` - Realiza login
- `GET /usuario/consultarUsuarios` - Lista usuários cadastrados
- `POST /agendamento/marcar` - Realiza a marcação do agendamento (login obrigatório)
- `PUT /agendamento/desmarcar` - Efetua a desmarcação do agendamento (login obrigatório)
- `GET /agendamento/horariosDisponiveis` - Listar próximos 5 dias úteis e horários disponíveis
- `GET /agendamento/horariosAgendados/:date` - Listar agendamentos por data no formado "DD/MM/YYYY"
- `GET /api-docs` - Documentação Swagger



## Executando a API GraphQL
Rode `npm run start-graphql` para executar a API do GraphQL e acesse a URL http://localhost:4000/graphql para acessá-la.

- **Types:**
  - `Usuarios`: usuario, senha
  - `Agendamentos`: nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico
  - `Enum de serviço`: CORTE, COLORACAO e ESCOVA
  
- **Queries:**
  - `consultaUsuarios`: consulta todos os usuários
  - `horariosDisponiveis`: Listar próximos 5 dias úteis e horários disponíveis
  - `horariosAgendados(date: String!)`: Listar agendamentos por data no formado "DD/MM/YYYY"

- **Mutations:**
  - `registrarUsuario(usuario, senha)`: Registra novo usuário
  - `logarUsuario(usuario, senha)`: Realiza login
  - `marcarAgendamento(nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico)`: Realiza a marcação do agendamento (login obrigatório)
  - `desmarcarAgendamento(nomeCliente, telefoneCliente, dataAgendada, horarioAgendado)`: Efetua a desmarcação do agendamento (login obrigatório)



## Regras de Negócio
- Não é permitido registrar usuários duplicados
- Login exige usuário e senha
- Só é possível marcar/desmarcar agendamento se estiver logado
- Não é possível agendar o mesmo serviço para o mesmo cliente no mesmo dia e horário
- Não é possível agendar horário já ocupado

## Observações
- Os dados são armazenados apenas em memória (variáveis)
- Estrutura separada em controller, service e model
- Documentação automática via Swagger



## Conceitos empregados k6:
- [Documentação detalhada](README_K6.md)

