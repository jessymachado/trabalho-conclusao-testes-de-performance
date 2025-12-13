const request = require('supertest');
const { expect, use } = require('chai');
const { getProximosDiasUteis } = require('../../../service/agendamentoService.js');
require('dotenv').config();

const chaiExclude = require('chai-exclude')
use(chaiExclude)

describe('Agendamento External api REST', () => {
    beforeEach(async () => {
        const respostaLogin = await request(process.env.BASE_URL_REST)
            .post('/usuario/logarUsuario')
            .send({
                usuario: 'jessy',
                senha: '123456'
            });

        token = respostaLogin.body.token;
    });

    describe('POST /agendamento/marcar: Valida a autenticação do usuário', () => {
        it('Quando marco um agendamento sem estar autenticado recebo 401', async () => {
            const dias = getProximosDiasUteis();
            const dataSelecionada = dias[4];

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/agendamento/marcar')
                .send({
                    nomeCliente: 'Daniela',
                    telefoneCliente: '51982844440',
                    dataAgendada: dataSelecionada,
                    horarioAgendado: '09:30',
                    servico: 'CORTE'
                });
            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('message', 'Token não fornecido.')
        });
    });

    describe('POST /agendamento/marcar : Valida o agendamento com sucesso', () => {
        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[3];

        const payloadMarcacao = {
            nomeCliente: 'Patrícia',
            telefoneCliente: '51982899999',
            dataAgendada: dataSelecionada,
            horarioAgendado: '11:30',
            servico: "COLORAÇÃO"
        };

        it('Quando marco um agendamento com sucesso recebo 200', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/agendamento/marcar')
                .set('Authorization', `Bearer ${token}`)
                .send(payloadMarcacao);

            expect(resposta.status).to.equal(201);

            const mensagem = resposta.body.message;
            expect(mensagem).to.equal('Agendamento realizado com sucesso!');

            const respostaEsperada = require('../fixture/respostas/quandoMarcoHorarioEuTenhoSucessoCom200.json');
            expect(resposta.body.agendamento)
                .excluding('dataAgendada')
                .to.deep.equal(respostaEsperada.agendamento);

        });

        afterEach(async () => {
            const respostaDesmarcar = await request(process.env.BASE_URL_REST)
                .put('/agendamento/desmarcar')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nomeCliente: payloadMarcacao.nomeCliente,
                    telefoneCliente: payloadMarcacao.telefoneCliente,
                    dataAgendada: payloadMarcacao.dataAgendada,
                    horarioAgendado: payloadMarcacao.horarioAgendado
                });

            expect(respostaDesmarcar.body.message).to.equal('Horário agendado foi desmarcado.');
            expect(respostaDesmarcar.status).to.equal(200);
        });
    });

    describe('POST /agendamento/marcar : Valida que agendamento duplicado é rejeitado', () => {
        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[2];
        const tentativas = [0, 1];
        let resposta;

        const payloadMarcacao = {
            nomeCliente: 'Patrícia',
            telefoneCliente: '51982899999',
            dataAgendada: dataSelecionada,
            horarioAgendado: '11:30',
            servico: "COLORAÇÃO"
        };

        it('Quando marco um agendamento para um cliente que já possui agendamento recebo erro 400', async () => {
            for (const idx of tentativas) {
                resposta = await request(process.env.BASE_URL_REST)
                    .post('/agendamento/marcar')
                    .set('Authorization', `Bearer ${token}`)
                    .send(payloadMarcacao);
            }
            expect(resposta.status).to.equal(400);
            expect(resposta.body.error || resposta.body.message).to.equal('Cliente já possui agendamento para este serviço neste dia e horário.');
        });

        afterEach(async () => {
            const respostaDesmarcar = await request(process.env.BASE_URL_REST)
                .put('/agendamento/desmarcar')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nomeCliente: payloadMarcacao.nomeCliente,
                    telefoneCliente: payloadMarcacao.telefoneCliente,
                    dataAgendada: payloadMarcacao.dataAgendada,
                    horarioAgendado: payloadMarcacao.horarioAgendado
                });

            expect(respostaDesmarcar.body.message).to.equal('Horário agendado foi desmarcado.');
            expect(respostaDesmarcar.status).to.equal(200);
        });
    });

    describe('PUT /agendamento/desmarcar: Valida que o agendamento foi desmarcado corretamente', () => {
        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[1];

        const payloadMarcacao = {
            nomeCliente: 'Jonas',
            telefoneCliente: '51982812365',
            dataAgendada: dataSelecionada,
            horarioAgendado: '09:30',
            servico: "COLORAÇÃO"
        };

        beforeEach(async () => {
            respostaMarcar = await request(process.env.BASE_URL_REST)
                .post('/agendamento/marcar')
                .set('Authorization', `Bearer ${token}`)
                .send(payloadMarcacao);
        });

        it('Quando desmarco um agendamento recebo sucesso 200', async () => {

            const respostaDesmarcar = await request(process.env.BASE_URL_REST)
                .put('/agendamento/desmarcar')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nomeCliente: payloadMarcacao.nomeCliente,
                    telefoneCliente: payloadMarcacao.telefoneCliente,
                    dataAgendada: payloadMarcacao.dataAgendada,
                    horarioAgendado: payloadMarcacao.horarioAgendado
                });

            expect(respostaDesmarcar.body.message).to.equal('Horário agendado foi desmarcado.');
            expect(respostaDesmarcar.status).to.equal(200);
        });
    });

    describe('GET /agendamento/horariosAgendados/{date} : Valida que três agendamentos estão presentes na consulta', () => {

        const dias = getProximosDiasUteis();
        const dataSelecionada = dias[2];

        const clientes = ['Jessica', 'Tamara', 'Tatiane'];
        const contatos = ['51982897600', '51982897611', '51982897622'];
        const horarioAgendado = ['09:00', '10:00', '10:30'];
        const servicos = ['COLORAÇÃO', 'CORTE', 'ESCOVA'];

        beforeEach(async () => {
            for (let idx = 0; idx < clientes.length; idx++) {
                await request(process.env.BASE_URL_REST)
                    .post('/agendamento/marcar')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horarioAgendado[idx],
                        servico: servicos[idx]
                    });
            }
        });

        it('Quando consulto três agendamentos para a data agendada recebo sucesso 200', async () => {
            const consultaHorariosAgendados = await request(process.env.BASE_URL_REST)
                .get(`/agendamento/horariosAgendados/${encodeURIComponent(dataSelecionada)}`)
                .set('Accept', 'application/json')

            for (let idx = 0; idx < clientes.length; idx++) {
                expect(clientes[idx]).to.equal(consultaHorariosAgendados.body.horariosAgendados[idx].nomeCliente);
                expect(contatos[idx]).to.equal(consultaHorariosAgendados.body.horariosAgendados[idx].telefoneCliente);
                expect(dataSelecionada).to.equal(consultaHorariosAgendados.body.horariosAgendados[idx].dataAgendada);
                expect(horarioAgendado[idx]).to.equal(consultaHorariosAgendados.body.horariosAgendados[idx].horarioAgendado);
                expect(servicos[idx]).to.equal(consultaHorariosAgendados.body.horariosAgendados[idx].servico);
            }
            expect(consultaHorariosAgendados.status).to.equal(200);
            expect(consultaHorariosAgendados.body.horariosAgendados).to.have.lengthOf(3);
        });

        afterEach(async () => {
            for (let idx = 0; idx < clientes.length; idx++) {
                await request(process.env.BASE_URL_REST)
                    .put('/agendamento/desmarcar')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        nomeCliente: clientes[idx],
                        telefoneCliente: contatos[idx],
                        dataAgendada: dataSelecionada,
                        horarioAgendado: horarioAgendado[idx]
                    });
            }
        });

    });

});
