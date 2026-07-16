// Host-local implementation of the composable-cart CartService port.
// There is no cart backend in this demo, so the host plays the "server"
// role the contract assigns it: it owns the pricing math (subtotal /
// promo discount / tax / total, all in minor units) and persists the cart
// in sessionStorage. Every mutation re-prices and returns the full CartDTO,
// exactly like the real BFF contract.

const STORAGE_KEY = 'cart'
const TAX_RATE = 0.08

// One promo code per cart (blink checkout parity).
const PROMOS = [
  { code: 'WELCOME10', percentOff: 10 },
  { code: 'SAVE20', percentOff: 20 },
]

const emptyState = () => ({ lines: [], promoCode: null })

const load = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    // Pre-composable shape was [{ product, quantity }] — migrate in place.
    if (Array.isArray(parsed)) {
      return {
        lines: parsed.map(({ product, quantity }) => toLine(product, quantity)),
        promoCode: null,
      }
    }
    if (parsed && Array.isArray(parsed.lines)) return parsed
    return emptyState()
  } catch {
    return emptyState()
  }
}

const save = (state) => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))

// CatalogProduct.price is major units; CartLineDTO.unitPrice is cents.
const toLine = (product, quantity) => ({
  id: product.sku || product.id,
  sku: product.sku || product.id,
  name: product.name,
  imageUrl: product.imageUrl,
  quantity,
  unitPrice: Math.round(product.price * 100),
})

const priceCart = (state) => {
  const subtotal = state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const promo = PROMOS.find((p) => p.code === state.promoCode)
  const discount = promo ? Math.round((subtotal * promo.percentOff) / 100) : 0
  const tax = Math.round((subtotal - discount) * TAX_RATE)
  return {
    id: 'local-cart',
    currency: 'USD',
    lines: state.lines,
    promoCode: promo ? promo.code : null,
    totals: { subtotal, discount, tax, total: subtotal - discount + tax },
  }
}

const success = (state) => {
  save(state)
  return Promise.resolve({ status: 'success', cart: priceCart(state) })
}

// CartService port — every method resolves; failures are { status: 'error' }.
export const cartService = {
  getCart() {
    return success(load())
  },

  // The panel-facing addLine only knows skus; in this host every add comes
  // through addProduct() below with the full catalog product, so an unknown
  // sku here means the line never existed.
  addLine(_context, { sku, quantity }) {
    const state = load()
    const line = state.lines.find((l) => l.sku === sku)
    if (!line) return Promise.resolve({ status: 'error', errorMessage: `Unknown sku: ${sku}` })
    line.quantity += quantity
    return success(state)
  },

  updateLineQuantity(_context, { lineId, quantity }) {
    const state = load()
    state.lines = quantity <= 0
      ? state.lines.filter((l) => l.id !== lineId)
      : state.lines.map((l) => (l.id === lineId ? { ...l, quantity } : l))
    return success(state)
  },

  removeLine(_context, { lineId }) {
    const state = load()
    state.lines = state.lines.filter((l) => l.id !== lineId)
    return success(state)
  },

  applyPromoCode(_context, { code }) {
    const state = load()
    const promo = PROMOS.find((p) => p.code === code.trim().toUpperCase())
    if (!promo) return Promise.resolve({ status: 'success', accepted: false, cart: priceCart(state) })
    state.promoCode = promo.code
    return success(state).then((r) => ({ ...r, accepted: true }))
  },

  removePromoCode() {
    const state = load()
    state.promoCode = null
    return success(state)
  },
}

// Host-side extras (not part of the port): the catalog composable emits the
// full product via onAddToCart, and checkout clears the cart after placing.
export const addProduct = (product, quantity = 1) => {
  const state = load()
  const sku = product.sku || product.id
  const line = state.lines.find((l) => l.sku === sku)
  if (line) line.quantity += quantity
  else state.lines.push(toLine(product, quantity))
  save(state)
  return priceCart(state)
}

export const clearCart = () => {
  const state = emptyState()
  save(state)
  return priceCart(state)
}
