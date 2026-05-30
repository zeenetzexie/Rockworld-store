// Add this code to your app/page.js file
// This replaces the broken Stripe button handler

// At the top of the file with other imports, make sure you have:
// import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe properly (add this near the top of your component file)
let stripePromise;
const getStripePromise = () => {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Add this handler function inside your StorePage component (before the return statement)
const handleStripeCheckout = async (e) => {
  e.preventDefault();

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    alert('Stripe is not configured');
    return;
  }

  setOrderLoading(true);

  try {
    // Create checkout session
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });

    const data = await response.json();

    if (!response.ok || !data.sessionId) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    // Redirect to Stripe checkout
    const stripe = await getStripePromise();
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    alert(`Payment failed: ${error.message}`);
    setOrderLoading(false);
  }
};

// In your checkout form, make sure the Stripe button looks like this:
// (This should be in your JSX return statement where the payment buttons are)

{process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
  <button
    type="button"
    disabled={orderLoading}
    onClick={handleStripeCheckout}
    style={{
      width: '100%',
      padding: '18px',
      background: orderLoading ? '#ccc' : '#000000',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: orderLoading ? 'not-allowed' : 'pointer',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}
  >
    💳 PAY WITH STRIPE (${cartTotal.toFixed(2)})
  </button>
)}
