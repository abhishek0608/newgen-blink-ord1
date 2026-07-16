import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { APP_CONTEXT } from '../lib/appContext'
import { cartService, addProduct, clearCart } from './localCartService'

// Host-owned cart, per the composable contract. The cart itself lives in
// localCartService (the host's "server"); this context just mirrors the
// latest server-confirmed CartDTO so Navbar/Checkout can read it, and lets
// the catalog composable's onAddToCart write into it. The cart page renders
// <CartPanel> against the same service and reports back via onCartChange.
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null) // CartDTO | null

  useEffect(() => {
    let alive = true
    cartService.getCart(APP_CONTEXT).then((result) => {
      if (alive && result.cart) setCart(result.cart)
    })
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => {
    const lines = cart?.lines ?? []
    return {
      cart,
      service: cartService,
      context: APP_CONTEXT,
      // CartPanel's onCartChange — keeps this mirror in sync with the panel.
      sync: setCart,
      add: (product, quantity = 1) => setCart(addProduct(product, quantity)),
      clear: () => setCart(clearCart()),
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      totals: cart?.totals ?? { subtotal: 0, discount: 0, tax: 0, total: 0 },
    }
  }, [cart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
