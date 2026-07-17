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
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Fresh from the connected catalog</p>
          <h1>Shop the gear that keeps every order moving.</h1>
          <p className="home-lede">
            Explore curated products, live Salesforce inventory, and a checkout
            flow built for fast B2B buying.
          </p>
          <div className="home-actions">
            <Link to="/products" className="home-primary-link">
              Browse catalog
            </Link>
          </div>
        </div>

        <div className="home-hero-art" aria-label="Featured commerce imagery">
          <img
            className="home-hero-image home-hero-image-main"
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
            alt="Modern workspace with shopping and order management tools"
          />
          <img
            className="home-hero-image home-hero-image-side"
            src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=560&q=80"
            alt="Customer completing a digital purchase"
          />
        </div>
      </section>

      <section className="home-benefits" aria-label="Store benefits">
        <div className="home-benefit-card">
          <span className="material-symbols-outlined home-benefit-icon">
            inventory_2
          </span>
          <div>
            <h2>One live catalog</h2>
            <p>Find active products and current availability in one place.</p>
          </div>
        </div>
        <div className="home-benefit-card">
          <span className="material-symbols-outlined home-benefit-icon">
            bolt
          </span>
          <div>
            <h2>Built for speed</h2>
            <p>Move from product discovery to checkout without extra steps.</p>
          </div>
        </div>
        <div className="home-benefit-card">
          <span className="material-symbols-outlined home-benefit-icon">
            verified_user
          </span>
          <div>
            <h2>Account-ready buying</h2>
            <p>Keep customer context connected throughout every order.</p>
          </div>
        </div>
      </section>

      {error && (
        <p className="home-error">Salesforce unavailable: {error}</p>
      )}

      {!stats && !error && <p className="home-loading">Loading org data...</p>}

      {stats && (
        <>
          <section className="home-stats" aria-label="Live storefront metrics">
            <div className="home-stat-card">
              <div className="home-stat-number">{stats.products}</div>
              <div className="home-stat-label">Active products</div>
            </div>
            <div className="home-stat-card">
              <div className="home-stat-number">{stats.accounts}</div>
              <div className="home-stat-label">Connected accounts</div>
            </div>
            <div className="home-stat-card home-stat-card-accent">
              <div className="home-stat-number">24/7</div>
              <div className="home-stat-label">Salesforce powered</div>
            </div>
          </section>

          <section className="home-showcase">
            <div className="home-showcase-copy">
              <p className="home-eyebrow">Built for momentum</p>
              <h2>One storefront, live catalog context, fewer slow handoffs.</h2>
              <p>
                Your sales team gets a polished buying experience while product
                and account data stay anchored to the org that already runs the
                business.
              </p>
            </div>
            <div className="home-collection">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=520&q=80"
                alt="Premium product assortment"
              />
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=520&q=80"
                alt="Team reviewing commerce orders"
              />
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=520&q=80"
                alt="Business team planning customer purchases"
              />
            </div>
          </section>

          <section id="newest-products" className="home-products">
            <div>
              <p className="home-eyebrow">Newest products</p>
              <h2>Recently added to the catalog</h2>
            </div>
            <ul className="home-product-list">
              {stats.recent.map((p) => (
                <li key={p.Id}>{p.Name}</li>
              ))}
            </ul>
            <Link to="/products" className="home-catalog-link">
              Browse the full catalog
            </Link>
          </section>
        </>
      )}
    </main>
  )
}
