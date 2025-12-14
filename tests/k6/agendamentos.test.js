import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { escolherDataEHorarios } from './utils/datas.js';
import { usuarios } from '../../model/userModel.js';
import faker from 'k6/x/faker';
import { SharedArray } from 'k6/data';
import { efetuarLogin } from './utils/login.test.js';

export const options = {
    vus: 2,
    iterations: 2
};


const dados = new SharedArray('agendamentos', () =>
    JSON.parse(open('./data/agendamentos.data.json'))
);


export default function () {
    let token = ''
    const idx = (__VU - 1) % dados.length;
    const user = usuarios[(__VU - 1) % usuarios.length];

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
        const dias = getProximosDiasUteis();
        const indiceAleatorio = Math.floor(Math.random() * dias.length);
        const dataSelecionada = dias[indiceAleatorio];

        const payloadMarcarHorario = {
            nomeCliente: faker.person.name(),
            telefoneCliente: faker.person.phone(),
            dataAgendada: dataSelecionada,
            horarioAgendado: dados[idx].horario,
            servico: dados[idx].servico,
        };

        let responseMarcarAgendamento = http.post(`${BASE_URL}/agendamento/marcar`,
            JSON.stringify(
                payloadMarcarHorario),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        
        check(responseMarcarAgendamento, {
            'status da marcação deve ser 201': (resp) => resp.status === 201,
            'mensagem deve ser de sucesso': (resp) =>
                resp.json('message') === 'Agendamento realizado com sucesso!',
        });
    });
}
