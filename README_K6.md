# Explicações dos conceitos aplicados no código
Esta API permite registrar, logar e consultar usuários, além de agendar horários para serviços em um salão de beleza. Documentação disponível via Swagger.


## Estrutura do projeto 
  ```mermaid
graph TD
    A[PROJETO]

    A --> B[controller]
    A --> C[service]
    A --> D[model]
    A --> E[middleware]
    A --> F[graphql]
    A --> G[tests]
    A --> H[k6-reports]

    %% Tests
    G --> I[k6]
    G --> J[graphql]
    G --> K[rest]
    I --> L[data]
    I --> M[helpers]
    I --> N[agendamentos.test.js]

    %% Data Driven
    L --> O[horarioServicos.data.json]

    %% Helpers 
    M --> P[datas.js]
    M --> Q[dadosAleatorios.js]
    M --> R[login.test.js]

    style A fill:#f9c,stroke:#333,stroke-width:2px,color:#000
    style G fill:#f9c,stroke:#333,stroke-width:2px,color:#000
    style H fill:#f9c,stroke:#333,stroke-width:2px,color:#000
    style I fill:#f9c,stroke:#333,stroke-width:2px,color:#000
```

## Thresholds
Segue abaixo as asserções de performance que se encontram no objeto de configuração do teste "export const options", se o teste não atender a estes critérios, o mesmo irá falhar.
* http_req_failed: Valida que menos de 1% das requisições falhem
* http_req_duration: Tempo total da duração deve responder conforme o tempo informado
  * Explicação dos percentis:
    * p(95) → 95% das requisições devem responder em menos de x milisegundos
    * p(99) → 99% das requisições  devem responder em menos de x milisegundos

    ``` 
  export const options = {
      thresholds: {
          http_req_failed: ['rate<0.01'],
          http_req_duration: ['p(95)<500', 'p(99)<800']        
      }
  };
  ```

## Checks
São pontos de checagens do código, inserido após a chamada de um requisição, a ideia seria
uma checagem básica a nível esperado e não um detalhamento de validações funcionais.

Esse trecho verifica se, ao consultar os horários agendados, existe pelo menos um registro que corresponde exatamente ao horário, à data e ao cliente que acabou de realizar o agendamento.

  ``` 
  check(responseConsultaHorarios, {
      "o horário agendado deve estar presente": () =>
          dados.horariosAgendados.some(
              (item) =>
                  item.dataAgendada === payloadMarcarHorario.dataAgendada &&
                  item.horarioAgendado === payloadMarcarHorario.horarioAgendado &&
                  item.telefoneCliente === payloadMarcarHorario.telefoneCliente
          )
  });
  ```

        
## Helpers
No helpers para auxílio foram colocados 3 arquivos.
  * datas.js: funções relacionadas as datas que serão utilizadas pelo teste.
  * dadosAleatorios.js: geração de dados dinâmicos.
  * login.test.js: onde foi abstraído para uma função a chamada para realizar um login.


## Trends
Trends são métricas usadas para medir e analisar o comportamento de valores ao longo do tempo, principalmente tempos de resposta.
No arquivo de teste foi incluída extensão para a utilização da métrica a seguir:
``` 
  import { Trend } from 'k6/metrics';
  const trendTempoMarcarAgendamento = new Trend('tempo_marcar_agendamento');
``` 
O objetivo desta métrica é medir o tempo exclusivamente da requisição de marcação de horário, abaixo estamos adicionando esta métrica após a execução do endpoint.
``` 
  trendTempoMarcarAgendamento.add(responseMarcarAgendamento.timings.duration);  
``` 
Segue um exemplo da visualização após a execução
``` 
 CUSTOM
    tempo_marcar_agendamento.......: avg=6.82308 min=2.1368 med=5.3484 max=17.7891 p(90)=11.48237 p(95)=14.428285
``` 


## Faker
Para a geração dos dados aleatórios no arquivo 'dadosAleatorios.js' está sendo feio o uso da biblioteca faker.
  ``` 
  import faker from 'k6/x/faker';

  export function randomName() {
      return `User_${Math.random().toString(36).substring(2, 8)}`;
  }

  export function randomPhone() {
      return faker.person.phone()
  }
  ```

## Variáveis de Ambiente
Neste projeto, utilizamos um arquivo `.env` para centralizar a parametrização das variáveis de ambiente responsáveis pelo acesso às APIs.

As principais variáveis configuradas são:
  ``` 
  BASE_URL_REST=http://localhost:3000  
  BASE_URL_GRAPHQL=http://localhost:4000
   ``` 


## Stages
Os stages também se encontram no objeto de configuração do teste "export const options", estamos definindo como a carga de usuários virtuais vai aumentar, se manter e dimunuir ao logo do tempo durante o teste.
O projeto conta com a parametrização das stages abaixo:
  ``` 
  export const options = {     
      stages: [
          { duration: '20s', target: 3 },
          { duration: '40s', target: 3 },
          { duration: '20s', target: 0 },
      ]
  };
  ```  
  1ª stage: O k6 sobe gradualmente de 0 até 3 usuários virtuais por 20 segundos.

  2ª stage: Mantém 3 usuários virtuais constantes durante 40 segundos.

  3ª stage: reduz gradualmente de 3 usuários para 0 ao longo de 20 segundos.

## Reaproveitamento de Resposta
A variável 'dataParaMarcacao' recebe o retorno da função escolherDataEHorarios, que utiliza como entrada os dados retornados pela API de horários disponíveis, já convertidos para JSON.
Essa função seleciona aleatoriamente uma combinação válida de data, horário e serviço, e o resultado é então reutilizado para compor o payload da requisição de marcação.
A imagem abaixo ilustra esse comportamento.
![alt text](reaproveitamento_requisicoes.png)


## Uso de Token de Autenticação
o token de autenticação é gerado após efetuar o login, o mesmo se encontra declaro com um variável no início da exportação padrão da função para que o escopo da variável seja acessível dentro de qualquer group necessário.
  ```
  export default function () {
      let token = ''
  }
  ```
  Abaixo estamos atribuindo na variável token, o resultado da chamada de uma função com retorno que 
  fará a requisição de login e guardará o token.
  ``` 
   group('Fazendo login com sucesso', function () {
        token = efetuarLogin(user);
    });
  ```

## Data-Driven Testing
Foi criado o ddt 'horariosEServicos.data.json' com objetivo de reutilizar vários horários e serviços que serão utilizados pela função 'escolherDataEHorarios'.

``` 
[
  { "horario": "09:00", "servico": "ESCOVA" },
  { "horario": "10:00", "servico": "CORTE" },
  { "horario": "10:30", "servico": "COLORAÇÃO" 
     .......etc 
  }
]
```

No teste, os dados são carregados com SharedArray:
``` 
const dados = new SharedArray('agendamentos', () =>
    JSON.parse(open('./data/horariosEServicos.data.json'))
);
```

A função escolherDataEHorarios recebe os dados retornados pela API (horariosDisponiveis) e cruza essas informações com o dataset externo, conforme o trecho abaixo:
 ``` 
const horariosValidos = horariosEServicos.filter(h =>
    dia.horarios.includes(h.horario)
);
 ``` 
Sendo assim, os dados são carregados uma única vez e são compartilhados entre todos os VUs


## Groups
Os groups funcionam como partições lógicas que ajudam a organizar os testes por categoria, fluxo ou endpoint, facilitando a leitura e a análise dos resultados.

No caso do projeto o mesmo foi separado em:

```
group('Fazendo login com sucesso', function () {
    
    //Este group faz a chamada para a função 'efetuarLogin' que realiza o login acessando a requisição e retorna o token.

});
```

```
group('Listar horários disponíveis', function () {
  
    //Chama o endpoint horariosDisponiveis que retorna os dias e horários disponíveis para agendamento.
    após o o resultado retornar 200, será convertido o corpo da resposta de string JSON para um objeto JavaScript. Na etapa final este retorno serve como parâmetro para a escolha do horário através de uma função 'escolherDataEHorarios' que retornará no objeto a data, horário e serviço para ser utilizado posteiormente.

});
```
```
group('Marcar agendamento com sucesso', function () {
    
    //Marca o agendamento a partir de um payload que é alimentado com as informações necessárias e obtidas na função citada acima.

});
```
```
group('Consultar horários agendados', function () {
  
    //Consulta o horário agendado a partir do payload payloadMarcarHorario, passando a data como parâmetro. Ao final do testes é validado se os dados retornados na consutla são equivalentes ao agendamento que foi feito para aquela data, horário e telefone.

});
```
```
group('Desmarcar os horários agendados', function () {
  
  //Demarca cada horário agendado a partir do payload já citado.

});
```