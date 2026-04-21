import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- ENDPOINT DE SALUD (Mínimo) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'minimal_reboot_f1', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/', (req, res) => {
  res.send('<h1>RORA Backend (Phase 1)</h1><p>Status: Clean Startup Success</p>');
});

// Bindeo inmediato
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RORA Minimal Backend is live on port ${PORT}`);
});
