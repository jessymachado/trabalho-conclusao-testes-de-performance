// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../../app');

// Mock
const userService = require('../../../service/userService');


describe('User Controller api REST', () => {
    describe('POST /usuarios/registrarUsuario', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/usuario/logarUsuario')
                .send({
                    usuario: 'jessy',
                    senha: '123456'
                });

            token = respostaLogin.body.token;            
        });      

        it('Usando Mocks: Quando registrar usuário já existente recebo 400', async () => {

            const registroUsuarioServiceMock = sinon.stub(userService, 'registrarUsuario');
            registroUsuarioServiceMock.throws(new Error('Usuário já existe.'));

            const resposta = await request(app)
                .post('/usuario/registrarUsuario')                
                .set('Authorization', `Bearer ${token}`)
                .send({
                    usuario: 'jessy',
                    senha: '123456',                  
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário já existe.');
        });

        afterEach(() => {            
            sinon.restore();
        })
    });
});