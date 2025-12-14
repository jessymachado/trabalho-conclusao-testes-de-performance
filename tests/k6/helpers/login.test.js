import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL_REST;

export function efetuarLogin(user) {
    let responseLoginUsuario = http.post(`${BASE_URL}/usuario/logarUsuario`,
        JSON.stringify(user),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    return responseLoginUsuario.json('token');
}