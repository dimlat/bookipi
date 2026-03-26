import { useEffect, useState } from "react";
import BuyButton from "./components/BuyButton";
import FlashSaleTimer from "./components/FlashSaleTimer";
import AdminPanel from "./components/AdminPanel";
import PurchaseList from "./components/PurchaseList";

function App() {
  const [stock, setStock] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // fetch stock global
  useEffect(() => {
    const fetchStock = async () => {
      const res = await fetch("http://localhost:8080/api/stock");
      const data = await res.json();
      setStock(data.stock);
    };

    fetchStock();
    const interval = setInterval(fetchStock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>🔥 Flash Sale</h1>

      <FlashSaleTimer setIsLive={setIsLive} />

      <h3>Stock: {stock}</h3>

      <BuyButton stock={stock} isLive={isLive} />
      <div style={{
        display: "flex",
        gap: 30,
        justifyContent: "center",
        marginTop: 50
      }}>
        <AdminPanel />
        <PurchaseList />
      </div>

    </div>
  );
}

export default App;