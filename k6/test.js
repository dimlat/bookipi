import http from 'k6/http';
import { sleep } from 'k6';

/* try complex scenario
export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2s', target: 1000 },
        { duration: '5s', target: 1000 },
        { duration: '2s', target: 0 },
      ],
    },
  },
};
*/

export const options = {
    vus: 200,
    duration: '10s',
};

export default function () {
    const userId = Math.floor(Math.random() * 1000000);

    http.get(`http://nginx/api/buy?user=${userId}`);

    sleep(0.1);
}