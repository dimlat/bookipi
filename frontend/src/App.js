import BuyButton from './components/BuyButton';
import Stock from './components/Stock';

function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>🔥 Flash Sale</h1>
      <Stock />
      <BuyButton />
    </div>
  );
}

export default App;