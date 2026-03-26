import { useState } from 'react';
import axios from 'axios';

export default function BuyButton() {
    const [status, setStatus] = useState('');

    const buy = async () => {
        try {
            const userId = Math.floor(Math.random() * 100000);

            const res = await axios.get(
                `http://localhost:8080/api/buy?user=${userId}`
            );

            setStatus(res.data);
        } catch (err) {
            setStatus(err.response?.data || 'Error');
        }
    };

    return (
        <div>
            <button onClick={buy} style={{ padding: 10, fontSize: 18 }}>
                🚀 Buy Now
            </button>
            <p>{status}</p>
        </div>
    );
}