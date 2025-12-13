const request = require('supertest');
const { expect, use } = require('chai');
const { getProximosDiasUteis } = require('../../../service/agendamentoService');

require('dotenv').config();

const chaiExclude = require('chai-exclude')
use(chaiExclude)

describe('Agendamento External GraphQL', () => {
    let token;

    before(async () => {
        const efetuarLogin = require('../fixture/requisicoes/login/logarUsuarioComSucesso.json')
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(efetuarLogin);

        token = resposta.body.data.logarUsuario.token;
    });

    describe('Mutation: marcarAgendamento', () => {
        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[2];

        const payload = {
            nomeCliente: 'Deise GraphQL',
            telefoneCliente: '51912345678',
            dataAgendada: dataSelecionada,
            horarioAgendado: '15:00',
            servico: 'COLORACAO'
        };

        it('Quando marco um agendamento com sucesso, recebo os dados do agendamento', async () => {
            const marcarMutation = {
                query: `mutation MarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!, $servico: Servico!) {
                    marcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado, servico: $servico) {
                        nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico
                    }
                }`,
                variables: payload
            };

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(marcarMutation);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.marcarAgendamento.servico).to.equal('COLORAÇÃO');
            expect(resposta.body.data.marcarAgendamento).excluding('servico').to.deep.equal(payload);

        });

        afterEach(async () => {
            const desmarcarMutation = {
                query: `mutation DesmarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!) {
                    desmarcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado)
                }`,
                variables: {
                    nomeCliente: payload.nomeCliente,
                    telefoneCliente: payload.telefoneCliente,
                    dataAgendada: payload.dataAgendada,
                    horarioAgendado: payload.horarioAgendado
                }
            };

            await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(desmarcarMutation);
        });
    });


    describe('Query: horariosAgendados', () => {

        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[2];

        const clientes = ['Jessica', 'Tatiane'];
        const contatos = ['51982897600', '51982897622'];
        const horariosAgendados = ['09:00', '10:30'];
        const servicos = ['COLORACAO', 'ESCOVA'];
        const servicosRetorno = ['COLORAÇÃO', 'ESCOVA'];

        beforeEach(async () => {
            for (let idx = 0; idx < clientes.length; idx++) {
                const marcarMutation = {
                    query: `mutation MarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!, $servico: Servico!) {
                        marcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado, servico: $servico) {
                            nomeCliente
                        }
                    }`,
                    variables: {
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horariosAgendados[idx],
                        servico: servicos[idx]
                    }
                };
                await request(process.env.BASE_URL_GRAPHQL)
                    .post('/graphql')
                    .set('Authorization', `Bearer ${token}`)
                    .send(marcarMutation);
            }
        });

        it('Quando consulto agendamentos para uma data, recebo a lista de agendamentos com sucesso', async () => {
            const horariosAgendadosQuery = {
                query: `query HorariosAgendados($data: String!) {
                    horariosAgendados(data: $data) { nomeCliente, telefoneCliente, dataAgendada, horarioAgendado, servico }
                }`,
                variables: { data: dataSelecionada }
            };
            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send(horariosAgendadosQuery);

            expect(resposta.status).to.equal(200);
            const agendamentos = resposta.body.data.horariosAgendados;
            expect(agendamentos).to.be.an('array').with.lengthOf(2);

            const agendamentosOrdenados = agendamentos.sort((a, b) => a.horarioAgendado.localeCompare(b.horarioAgendado));
            for (let idx = 0; idx < clientes.length; idx++) {
                expect(agendamentosOrdenados[idx]).to.deep.equal({
                    nomeCliente: clientes[idx],
                    telefoneCliente: contatos[idx],
                    dataAgendada: dataSelecionada,
                    horarioAgendado: horariosAgendados[idx],
                    servico: servicosRetorno[idx]
                });
            }

        });

        afterEach(async () => {
            for (let idx = 0; idx < clientes.length; idx++) {
                const desmarcarMutation = {
                    query: `mutation DesmarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!) {
                                desmarcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado)
                            }`,
                    variables: {
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horariosAgendados[idx]
                    }
                };
                await request(process.env.BASE_URL_GRAPHQL)
                    .post('/graphql').set('Authorization', `Bearer ${token}`)
                    .send(desmarcarMutation);
            }
        });
    });
    describe('Query: horariosDisponiveis', () => {
        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[0];
        const clientes = ['Jessica', 'Tatiane'];
        const contatos = ['51982897600', '51982897622'];
        const horariosAgendados = ['09:00', '09:30'];
        const servicos = ['COLORACAO', 'ESCOVA'];


        beforeEach(async () => {
            for (let idx = 0; idx < horariosAgendados.length; idx++) {
                const marcarMutation = {
                    query: `mutation MarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!, $servico: Servico!) {
                        marcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado, servico: $servico) {
                        nomeCliente telefoneCliente dataAgendada horarioAgendado servico
                    }
                }`,
                    variables: {
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horariosAgendados[idx],
                        servico: servicos[idx]
                    }
                };
                await request(process.env.BASE_URL_GRAPHQL)
                    .post('/graphql')
                    .set('Authorization', `Bearer ${token}`)
                    .send(marcarMutation);
            }

        });

        it('Quando listo os horários disponíveis, os dois horários agendados não devem aparecer', async () => {
            const horariosRetornadosSemOsDoisAgendamentos = [
                '10:00', '10:30', '11:00', '11:30',
                '13:30', '14:00', '14:30', '15:00',
                '15:30', '16:00', '16:30', '17:00',
                '17:30', '18:00'
            ];

            const horariosDisponiveisQuery = {
                query: `query HorariosDisponiveis { horariosDisponiveis { datas, horarios } }`
            };

            const resposta = await request(process.env.BASE_URL_GRAPHQL)
                .post('/graphql')
                .send(horariosDisponiveisQuery);

            expect(resposta.status).to.equal(200);

            const horariosRetornadosParaPrimeiraDataSelecionada =
                resposta.body.data.horariosDisponiveis[0].horarios;

            expect(horariosRetornadosParaPrimeiraDataSelecionada)
                .to.not.include(horariosAgendados[0]);
            expect(horariosRetornadosParaPrimeiraDataSelecionada)
                .to.not.include(horariosAgendados[1]);

            expect(horariosRetornadosParaPrimeiraDataSelecionada)
                .to.deep.equal(horariosRetornadosSemOsDoisAgendamentos);
        });

        afterEach(async () => {
            for (let idx = 0; idx < horariosAgendados.length; idx++) {
                const desmarcarMutation = {
                    query: `mutation DesmarcarAgendamento($nomeCliente: String!, $telefoneCliente: String!, $dataAgendada: String!, $horarioAgendado: String!) {
                            desmarcarAgendamento(nomeCliente: $nomeCliente, telefoneCliente: $telefoneCliente, dataAgendada: $dataAgendada, horarioAgendado: $horarioAgendado)
                        }`,
                    variables: {
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horariosAgendados[idx]
                    }
                };
                await request(process.env.BASE_URL_GRAPHQL)
                    .post('/graphql').set('Authorization', `Bearer ${token}`)
                    .send(desmarcarMutation);
            }
        });
    });
});
