import { createContext, useContext, useMemo, useState } from 'react'

// The cart itself lives in Salesforce (the active quote) and is rendered by
// the composable CartPanel. The host only tracks the active quote id and a
// line-item count for the navbar badge, fed by the panels' callbacks.

const QUOTE_KEY = 'activeQuoteId'
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [quoteId, setQuoteIdState] = useState(
    () => localStorage.getItem(QUOTE_KEY) || null,
  )
  const [itemCount, setItemCount] = useState(0)

  const value = useMemo(() => {
    const setQuoteId = (id) => {
      if (id) localStorage.setItem(QUOTE_KEY, id)
      else localStorage.removeItem(QUOTE_KEY)
      setQuoteIdState(id || null)
    }

    // Sync from the composable CartDTO (CartPanel onCartChange).
    const syncFromCart = (cart) => {
      if (!cart) return
      if (cart.id) setQuoteId(cart.id)
      setItemCount(cart.lines.reduce((sum, line) => sum + line.quantity, 0))
    }

    // Optimistic badge bump for catalog add-to-cart (CatalogPanel onAddedToCart
    // only carries the quote id, not the full cart).
    const bump = (quantity = 1) => setItemCount((count) => count + quantity)

    const clear = () => {
      setQuoteId(null)
      setItemCount(0)
    }

    return { quoteId, setQuoteId, itemCount, syncFromCart, bump, clear }
  }, [quoteId, itemCount])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
