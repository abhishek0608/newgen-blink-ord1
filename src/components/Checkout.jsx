import { CheckoutPanel } from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { useCart } from '../cart/CartContext'

// Composable checkout accordion (account, shipping address, shipping method,
// terms/payment) against the active Salesforce quote.
export default function Checkout() {
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return <p className="home-error">Salesforce unavailable: {error.message}</p>
  }
  if (!cart.quoteId) {
    return <p className="home-loading">No active cart yet — add something from the catalog first.</p>
  }
  if (!context) {
    return <p className="home-loading">Connecting to Salesforce...</p>
  }

  return (
    <CheckoutPanel
      context={context}
      summaryTitle="Quote Summary"
      onOrderPlaced={() => cart.clear()}
    />
  )
}
