import { Link } from 'react-router-dom'

export default function Home() {
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
    </main>
  )
}
