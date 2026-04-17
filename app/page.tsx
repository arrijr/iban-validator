export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '600px' }}>
      <h1>IBAN Validator Pro API</h1>
      <p>Validate IBANs and get structured bank details — BIC, country, currency, parsed account components.</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>POST /api/v1/validate</code> — Single IBAN validation</li>
        <li><code>POST /api/v1/validate/batch</code> — Batch (up to 100)</li>
        <li><code>GET /api/health</code> — Service health</li>
      </ul>
      <p>
        Available on{' '}
        <a href="https://rapidapi.com" target="_blank" rel="noreferrer">RapidAPI</a>.
      </p>
    </main>
  )
}
