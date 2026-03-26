import { useEffect, useState } from "react";

export default function PurchaseList() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("http://localhost:8080/api/purchases");
            const json = await res.json();
            setData(json);
        };

        fetchData();

        const interval = setInterval(fetchData, 2000); // refresh tiap 2 detik
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.card}>
            <h3>🏆 Successful Buyers</h3>

            {data.length === 0 && <p>No purchases yet</p>}

            {data.map((item, i) => (
                <div key={i} style={styles.item}>
                    <span>#{i + 1}</span>
                    <strong>{item.userId}</strong>
                </div>
            ))}
        </div>
    );
}

const styles = {
    card: {
        background: "#1e1e2f",
        padding: 20,
        borderRadius: 12,
        color: "white",
        width: 260,
        height: 300,
        overflowY: "auto"
    },
    item: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 10,
        padding: 8,
        background: "#2a2a3d",
        borderRadius: 6
    }
};