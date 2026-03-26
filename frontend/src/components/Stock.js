import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Stock() {
    const [stock, setStock] = useState(0);

    const fetchStock = async () => {
        const res = await axios.get('http://localhost:8080/api/stock');
        setStock(res.data.stock);
    };

    useEffect(() => {
        fetchStock();
        const interval = setInterval(fetchStock, 1000);
        return () => clearInterval(interval);
    }, []);

    return <h2>Stock: {stock}</h2>;
}