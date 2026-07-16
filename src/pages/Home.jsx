import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { soql } from '../lib/sfSession'

// Host page calling Salesforce directly: one shared token (sfSession), then
// plain SOQL — no composable involved.
export default function Home() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [products, accounts, recent] = await Promise.all([
          soql('SELECT COUNT() FROM Product2 WHERE IsActive = true'),
          soql('SELECT COUNT() FROM Account'),
          soql('SELECT Id, Name FROM Product2 WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 5'),
        ])
        if (!cancelled) {
          setStats({
            products: products.totalSize,
            accounts: accounts.totalSize,
            recent: recent.records,
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page" style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Welcome</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>Live data from the ec-ord1-dev-ed Salesforce org.</p>

      {error && (
        <p style={{ color: '#b91c1c' }}>Salesforce unavailable: {error}</p>
      )}

      {!stats && !error && <p>Loading org data…</p>}

      {stats && (
        <>
          <div style={{ display: 'flex', gap: 16, margin: '24px 0' }}>
            <div style={cardStyle}>
              <div style={numberStyle}>{stats.products}</div>
              <div style={labelStyle}>Active products</div>
            </div>
            <div style={cardStyle}>
              <div style={numberStyle}>{stats.accounts}</div>
              <div style={labelStyle}>Accounts</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 8 }}>Newest products</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9, marginTop: 0 }}>
            {stats.recent.map((p) => (
              <li key={p.Id}>{p.Name}</li>
            ))}
          </ul>
          <Link to="/products" style={{ color: '#c2703e', fontWeight: 600 }}>
            Browse the full catalog →
          </Link>
        </>
      )}
    </div>
  )
}

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '20px 28px',
  background: '#fff',
  minWidth: 160,
}
const numberStyle = { fontSize: 32, fontWeight: 700 }
const labelStyle = { color: '#6b7280', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }
