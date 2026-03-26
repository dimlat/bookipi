import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 200, // virtual users
    duration: '10s',
};

export default function () {
    const userId = Math.floor(Math.random() * 1000000);

    const res = http.get(
        `http://nginx/api/buy?user=${userId}`
    );

    check(res, {
        'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    });

    sleep(0.1);
}