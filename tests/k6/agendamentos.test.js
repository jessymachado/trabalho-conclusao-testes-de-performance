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


export const options = {
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500', 'p(99)<800'],
        iteration_duration: ['p(95)<1200']
    },
    stages: [
        { duration: '20s', target: 3 },
        { duration: '40s', target: 3 },
        { duration: '20s', target: 0 },
    ]
};


export default function () {
    let token = ''
    let responseMarcarAgendamento;
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

    group('Desmarcar os horários agendados', function () {

        let responseDesmarcarAgendamento = http.put(`${BASE_URL}/agendamento/desmarcar`,
            JSON.stringify(payloadMarcarHorario),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

        check(responseDesmarcarAgendamento, {
            'status da desmarcação deve ser 200': (resp) => resp.status === 200,
            'mensagem deve ser de sucesso': (resp) =>
                resp.json('message') === 'Horário agendado foi desmarcado.',
        });
    });
}
