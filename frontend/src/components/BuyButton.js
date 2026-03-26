import { useState } from "react";

export default function BuyButton({ stock, isLive }) {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [username, setUsername] = useState("");

    const isOutOfStock = !stock || stock <= 0;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleBuy = async (type) => {
        if (!username.trim()) {
            showToast("⚠️ Please enter username", "error");
            return;
        }

        try {
            setLoading(true);

            const baseUrl =
                type === "kafka"
                    ? "http://localhost:8080/api/buy"
                    : "http://localhost:8080/api/buy-bull";

            const url = `${baseUrl}?user=${encodeURIComponent(username)}`;

            const res = await fetch(url);
            const text = await res.text();

            showToast(text, "success");
        } catch (err) {
            showToast("❌ Failed to buy", "error");
        } finally {
            setLoading(false);
        }
    };

    const disabled = !isLive || isOutOfStock || loading;

    const getLabel = () => {
        if (!isLive) return "Not Started";
        if (isOutOfStock) return "Out of Stock";
        if (loading) return "Processing...";
        return "Buy Now";
    };

    return (
        <>
            {/* TOAST */}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background:
                        toast.type === "error" ? "#ef4444" : "#22c55e",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    fontWeight: "bold",
                    zIndex: 999
                }}>
                    {toast.msg}
                </div>
            )}

            {/* USER INPUT */}
            <div style={{ textAlign: "center", marginBottom: 15 }}>
                <input
                    type="text"
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        width: 220,
                        background: "#2a2a3d",
                        color: "white",
                        outline: "none",
                        textAlign: "center"
                    }}
                />
            </div>

            {/* BUTTONS */}
            <div style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 10
            }}>
                <button
                    onClick={() => handleBuy("kafka")}
                    disabled={disabled}
                    style={{
                        ...styles.button,
                        background: disabled ? "#555" : "#f97316"
                    }}
                >
                    ⚡ Buy Via Kafka
                    <br />
                    <small>{getLabel()}</small>
                </button>

                <button
                    onClick={() => handleBuy("bull")}
                    disabled={disabled}
                    style={{
                        ...styles.button,
                        background: disabled ? "#555" : "#3b82f6"
                    }}
                >
                    🐂 Buy Via BullMQ
                    <br />
                    <small>{getLabel()}</small>
                </button>
            </div>
        </>
    );
}

const styles = {
    button: {
        padding: "14px 18px",
        fontSize: "16px",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        minWidth: 130,
        transition: "all 0.2s ease",
    }
};