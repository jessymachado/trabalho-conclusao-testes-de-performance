import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { HORARIOS, SERVICOS } from './helpers/constantes.js';
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
    const user = usuarios[(__VU - 1) % usuarios.length];    

    group('Fazendo login com sucesso', function () {        
        token = efetuarLogin(user);                
    });

}
