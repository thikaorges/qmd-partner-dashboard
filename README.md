# qmd Global Partner Dashboard

Dashboard gestionale per la rete partner globale di Hakomed Italia.

## Stack
- Frontend: React 18 + Tailwind CSS + Framer Motion
- Backend: FastAPI (Python 3.11) + MongoDB
- Auth: JWT con 4 utenti whitelisted

## Deploy su Railway

1. Crea un nuovo progetto su Railway
2. Collega questo repository
3. Aggiungi un servizio MongoDB (plugin)
4. Imposta le variabili d'ambiente:
   - MONGO_URL -> fornito automaticamente dal plugin MongoDB
   - DB_NAME -> qmd_partners
   - JWT_SECRET -> genera una stringa sicura
   - PORT -> 8000 (Railway lo imposta automaticamente)
5. La prima volta che accedi, il backend creera automaticamente i 4 utenti
6. Per caricare i 54 partner, fai login e chiama POST /api/partners/seed

## Utenti predefiniti
- thika.orges@gmail.com / Hakomed2026!
- thika@hakomed.it / Hakomed2026!
- martin@hakomed.it / Hakomed2026!
- hansjoerg@hakomed.it / Hakomed2026!

## Sviluppo locale
docker-compose up --build
Il sito sara su http://localhost:8000

## Funzionalita
- Login JWT protetto
- Dashboard partner con filtri regionali e ricerca
- Codifica colori: Verde=Current, Giallo=Standby, Rosso=Old
- Barra progresso fatturato (target 3M / attuale 1.4M)
- Pagine dettaglio partner con log cronologici append-only
- Export Excel e PDF con stile Medical-Chic
- Keep-alive automatico (previene cold-start)
