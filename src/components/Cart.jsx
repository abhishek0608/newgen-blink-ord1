import { useNavigate } from 'react-router-dom'
import { CartPanel } from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// Composable cart page: line table, promo code, and quote summary render from
// the active Salesforce quote; the host keeps only the checkout hand-off.
export default function Cart() {
  const navigate = useNavigate()
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return <p className="home-error">Salesforce unavailable: {error.message}</p>
  }
  if (!context) {
    return <p className="home-loading">Connecting to Salesforce...</p>
  }

  return (
    <CartPanel
      context={context}
      userType={USER_TYPE}
      title="Cart"
      summaryTitle="Order Summary"
      onCartChange={cart.syncFromCart}
      onCheckout={(activeCart) => {
        if (activeCart?.id) cart.setQuoteId(activeCart.id)
        navigate('/checkout')
      }}
    />
  )
}
