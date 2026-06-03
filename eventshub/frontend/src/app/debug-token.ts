// Script di debugging per testare la trasmissione del token JWT
// Copia e incolla questo nel DevTools della console del browser

(async () => {
  console.log("🧪 Test trasmissione token JWT...\n");
  
  // 1. Controlla se il token è nel localStorage
  const token = localStorage.getItem('access_token');
  console.log("✅ Token nel localStorage:", token ? `${token.substring(0, 50)}...` : "❌ MANCANTE");
  
  // 2. Testa l'endpoint di debug del backend
  try {
    const response = await fetch('https://reimagined-space-dollop-69vg99wrvv7qcg9q-5000.app.github.dev/api/debug/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log("\n📨 Risposta endpoint /api/debug/token (SENZA token):");
    console.log(data);
  } catch (e) {
    console.error("Errore:", e);
  }
  
  // 3. Testa con HttpClient Angular (simula la chiamata che farebbe il componente)
  console.log("\n🔍 Provando a fare una richiesta vera dal frontend...");
  console.log("Vai su: https://reimagined-space-dollop-69vg99wrvv7qcg9q-4200.app.github.dev");
  console.log("Apri la DevTools (F12)");
  console.log("Vai su Network tab");
  console.log("Aggiungi una recensione o compra un biglietto");
  console.log("Guarda la richiesta POST a /api/reviews o /api/tickets");
  console.log("Controlla se include l'header 'Authorization: Bearer ...'");
})();
