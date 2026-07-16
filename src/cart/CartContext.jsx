import { createContext, useContext, useMemo, useState } from 'react'

// Host-owned cart, per the composable contract ("the host owns the cart").
// The catalog composable emits (product, quantity) via onAddToCart; a future
// cart composable would render `lines` and emit mutations back here.
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]) // [{ product, quantity }]

  const value = useMemo(() => {
    const add = (product, quantity = 1) =>
      setLines((prev) => {
        const existing = prev.find((line) => line.product.id === product.id)
        if (existing) {
          return prev.map((line) =>
            line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line,
          )
        }
        return [...prev, { product, quantity }]
      })

    const setQuantity = (productId, quantity) =>
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((line) => line.product.id !== productId)
          : prev.map((line) => (line.product.id === productId ? { ...line, quantity } : line)),
      )

    const remove = (productId) => setLines((prev) => prev.filter((line) => line.product.id !== productId))
    const clear = () => setLines([])

    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
    const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

    return { lines, add, setQuantity, remove, clear, itemCount, total }
  }, [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
