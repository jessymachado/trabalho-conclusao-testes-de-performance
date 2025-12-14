import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { escolherDataEHorarios } from './utils/datas.js';
import { usuarios } from '../../model/userModel.js';
import faker from 'k6/x/faker';
import { SharedArray } from 'k6/data';
import { efetuarLogin } from './utils/login.test.js';

const BASE_URL = __ENV.BASE_URL_REST;

const dados = new SharedArray('agendamentos', () =>
    JSON.parse(open('./data/agendamentos.data.json'))
);


export default function () {
    let token = ''
    let responseMarcarAgendamento;
    const idx = (__VU - 1) % dados.length;
    const user = usuarios[(__VU - 1) % usuarios.length];

    const payloadMarcarHorario = {
        nomeCliente: faker.person.name(),
        telefoneCliente: faker.person.phone(),
        dataAgendada: '',
        horarioAgendado: '',
        servico: '',
    };

    let dataParaMarcacao = ''

    group('Fazendo login com sucesso', function () {
        token = efetuarLogin(user);
    });

    group('Listar horários disponíveis', function () {

        const responseConsultaHorarios = http.get(
            `${BASE_URL}/agendamento/horariosDisponiveis/`
        );

        check(responseConsultaHorarios, {
            'status da lista de horários deve ser 200': (r) => r.status === 200,
        });

        const dados = responseConsultaHorarios.json();
        dataParaMarcacao = escolherDataEHorarios(dados);

        console.log('Data escolhida:', JSON.stringify(dataParaMarcacao, null, 3));
    });

    group('Marcar agendamento com sucesso', function () {

        payloadMarcarHorario.dataAgendada = dataParaMarcacao.data;
        payloadMarcarHorario.horarioAgendado = dataParaMarcacao.horario;
        payloadMarcarHorario.servico = dataParaMarcacao.servico;

        responseMarcarAgendamento = http.post(
            `${BASE_URL}/agendamento/marcar`,
            JSON.stringify(payloadMarcarHorario),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log(responseMarcarAgendamento.body)
        check(responseMarcarAgendamento, {
            'status da marcação deve ser 201': (resp) => resp.status === 201,
            'mensagem de marcação deve ser de sucesso': (resp) =>
                resp.json('message') === 'Agendamento realizado com sucesso!',
        });
    });

    group('Consultar horários agendados', function () {

        let responseConsultaHorarios = http.get(
            `${BASE_URL}/agendamento/horariosAgendados/${encodeURIComponent(payloadMarcarHorario.dataAgendada)}`
        );

        const dados = JSON.parse(responseConsultaHorarios.body);
        console.log(dados)

        check(responseConsultaHorarios, {
            "o horário agendado deve estar presente": () =>
                dados.horariosAgendados.some(
                    (item) =>
                        item.dataAgendada === payloadMarcarHorario.dataAgendada &&
                        item.horarioAgendado === payloadMarcarHorario.horarioAgendado &&
                        item.telefoneCliente === payloadMarcarHorario.telefoneCliente
                )
        });
    });
}
