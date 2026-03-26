import { useState } from "react";

export default function AdminPanel() {
    const [time, setTime] = useState("00:00:00");
    const [duration, setDuration] = useState(20);
    const [stock, setStock] = useState(20);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const startFlashSale = async () => {
        const [h, m, s] = time.split(":");

        const startAt = new Date();
        startAt.setHours(h, m, s, 0);

        if (startAt.getTime() < Date.now()) {
            showToast("⛔ Waktu sudah lewat!", "error");
            return;
        }

        try {
            setLoading(true);

            await fetch("http://localhost:8080/api/flash-sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startAt: startAt.getTime(),
                    duration: duration * 1000
                })
            });

            showToast("🔥 Flash sale scheduled!");
        } catch (err) {
            showToast("❌ Failed to schedule", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async () => {
        try {
            setLoading(true);

            await fetch("http://localhost:8080/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: Number(stock) })
            });

            showToast("📦 Stock updated!");
        } catch (err) {
            showToast("❌ Failed update stock", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            {/* TOAST */}
            {toast && (
                <div style={{
                    ...styles.toast,
                    background: toast.type === "error" ? "#ef4444" : "#22c55e"
                }}>
                    {toast.msg}
                </div>
            )}

            <h2 style={styles.title}>⚙️ Admin Panel</h2>

            {/* TIMER */}
            <div style={styles.section}>
                <h4>⏱️ Schedule Flash Sale</h4>

                <input
                    type="time"
                    step="1"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={styles.input}
                />

                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={styles.input}
                    />
                    <span style={{ alignSelf: "center" }}>sec</span>
                </div>

                <button
                    style={{
                        ...styles.buttonPrimary,
                        opacity: loading ? 0.6 : 1
                    }}
                    onClick={startFlashSale}
                    disabled={loading}
                >
                    🚀 {loading ? "Processing..." : "Set Flash Sale"}
                </button>
            </div>

            {/* STOCK */}
            <div style={styles.section}>
                <h4>📦 Set Stock</h4>

                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    style={styles.input}
                />

                <button
                    style={{
                        ...styles.buttonSecondary,
                        opacity: loading ? 0.6 : 1
                    }}
                    onClick={updateStock}
                    disabled={loading}
                >
                    📦 {loading ? "Updating..." : "Update Stock"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    card: {
        marginTop: 40,
        padding: 25,
        background: "linear-gradient(135deg, #1e1e2f, #151521)",
        borderRadius: 16,
        color: "white",
        width: 340,
        marginInline: "auto",
        boxShadow: "0 15px 40px rgba(0,0,0,0.5)"
    },
    title: {
        marginBottom: 20,
        textAlign: "center"
    },
    section: {
        marginBottom: 25
    },
    input: {
        display: "block",
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        width: "100%",
        borderRadius: 8,
        border: "none",
        outline: "none",
        background: "#2a2a3d",
        color: "white"
    },
    buttonPrimary: {
        padding: 12,
        width: "100%",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        border: "none",
        borderRadius: 10,
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "0.2s"
    },
    buttonSecondary: {
        padding: 12,
        width: "100%",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        border: "none",
        borderRadius: 10,
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "0.2s"
    },
    toast: {
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 20px",
        borderRadius: "10px",
        color: "white",
        fontWeight: "bold",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        zIndex: 999,
        animation: "slideDown 0.3s ease"
    }
};