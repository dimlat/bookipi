import { useEffect, useState } from "react";

export default function FlashSaleTimer({ setIsLive }) {
    const [offset, setOffset] = useState(0);
    const [now, setNow] = useState(Date.now());
    const [sale, setSale] = useState({
        startAt: null,
        endAt: null
    });

    // fetch flash sale every 5 seconds
    useEffect(() => {
        const fetchSale = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/flash-sale");
                const data = await res.json();
                setSale(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchSale();
        const interval = setInterval(fetchSale, 5000);
        return () => clearInterval(interval);
    }, []);

    // 🔥 sync server time
    useEffect(() => {
        fetch("http://localhost:8080/api/time")
            .then(res => res.json())
            .then(data => {
                setOffset(data.serverTime - Date.now());
            });
    }, []);

    // ticking clock
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now() + offset);
        }, 1000);

        return () => clearInterval(interval);
    }, [offset]);

    const { startAt, endAt } = sale;

    let isComing = false;
    let isLive = false;
    let isEnded = false;
    let remaining = 0;

    if (startAt && endAt) {
        isComing = now < startAt;
        isLive = now >= startAt && now <= endAt;
        isEnded = now > endAt;

        remaining = isComing
            ? startAt - now
            : isLive
                ? endAt - now
                : 0;
    }

    useEffect(() => {
        setIsLive(isLive);
    }, [isLive, setIsLive]);

    // No data
    if (!startAt || !endAt) {
        return (
            <div style={styles.card}>
                <p style={{ color: "#aaa" }}>⏳ Waiting for flash sale...</p>
            </div>
        );
    }

    // time format (mm:ss)
    const formatTime = (ms) => {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const statusText = isComing
        ? "⏳ Coming Soon"
        : isLive
            ? "🔥 LIVE NOW"
            : "❌ Ended";

    const statusColor = isComing
        ? "#facc15"
        : isLive
            ? "#22c55e"
            : "#ef4444";

    return (
        <div style={styles.card}>
            <h2 style={{ ...styles.status, color: statusColor }}>
                {statusText}
            </h2>

            <div style={styles.timer}>
                {formatTime(remaining)}
            </div>

            {isLive && (
                <p style={styles.sub}>
                    ⚡ Hurry up! Stock is burning...
                </p>
            )}
        </div>
    );
}

const styles = {
    card: {
        marginTop: 20,
        padding: 25,
        borderRadius: 12,
        background: "#1e1e2f",
        color: "white",
        width: 260,
        marginInline: "auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        textAlign: "center"
    },
    status: {
        marginBottom: 10
    },
    timer: {
        fontSize: 36,
        fontWeight: "bold",
        letterSpacing: 2
    },
    sub: {
        marginTop: 10,
        fontSize: 13,
        color: "#aaa"
    }
};