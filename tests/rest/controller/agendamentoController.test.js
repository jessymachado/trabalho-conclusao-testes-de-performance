// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../../app');

// Mock
const agendamentoService = require('../../../service/agendamentoService');

// Testes
describe('Agendamento Controller api REST', () => {
    describe('PUT /agendamento/desmarcar', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/usuario/logarUsuario')
                .send({
                    usuario: 'jessy',
                    senha: '123456'
                });

            token = respostaLogin.body.token;            
        });



        it('Usando Mocks: Quando desmarcar um horário que não estiver agendado recebo 400', async () => {

            const agendamentoServiceMock = sinon.stub(agendamentoService, 'desmarcarAgendamento');
            agendamentoServiceMock.throws(new Error('Agendamento não encontrado.'));

            const resposta = await request(app)
                .put('/agendamento/desmarcar')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nomeCliente: 'Chaiane',
                    telefoneCliente: '51982897665',
                    dataAgendada: '14/09/2025',
                    horarioAgendado: '10:30'
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Agendamento não encontrado.');
        });      

        afterEach(() => {            
            sinon.restore();
        })
    });
});