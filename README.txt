# Biblioteca Digitale

Prototipo front-end in HTML, CSS e JavaScript ispirato al mockup approvato.

## Avvio
Aprire `index.html` nel browser. La dashboard funziona anche in modalità demo senza backend.

## Integrazione backend
Il file `app.js` tenta di collegarsi a:
- `GET /api/stats`
- `GET /api/books`
- `POST /api/mets/generate-missing` (da implementare nel backend)

La risposta di `/api/stats` può contenere `books`, `users`, `collections`.
La risposta di `/api/books` può essere un array oppure un oggetto con proprietà `books`.
Ogni libro può contenere `id`, `title`, `author`, `pages`, `matched`, `has_mets`.

Le funzioni di importazione catalogo e generazione METS sono predisposte a livello di interfaccia: per l'esecuzione reale vanno collegate agli endpoint applicativi esistenti.

## Note
- Le immagini e i font remoti richiedono una connessione internet.
- I dati mostrati in modalità demo sono segnaposto, non dati bibliotecari reali.
- Layout responsive e supporto base a tastiera/focus.
