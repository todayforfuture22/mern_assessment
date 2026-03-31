/**
 * TODO (Assessment Task - Frontend 3): Implement the cart page.
 * - Use local state (useState) or context to hold cart items: { productId, quantity }[].
 * - For each cart item, resolve the product (e.g. from GET /api/products or a single product fetch) to show name and price.
 * - Display each line item (product name, quantity, unit price, line total).
 * - Display the cart total (sum of line totals).
 * You may seed the cart with 1–2 items for demo, or add "Add to cart" on the product detail page.
 */
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Product } from '../types';

type CartItem = { productId: string; quantity: number };

export default function Cart() {
  const [cartItems] = useState<CartItem[]>([
    { productId: 'prod1', quantity: 1 },
    { productId: 'prod2', quantity: 2 },
  ]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    api
      .getProducts()
      .then((data) => mounted && setProducts(data))
      .catch((err: Error) => mounted && setError(err.message || 'Failed to load products'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const lines = useMemo(() => {
    if (!products) return [];
    return cartItems
      .map((ci) => {
        const p = products.find((x) => x.id === ci.productId);
        if (!p) return null;
        const lineTotal = Math.round(p.price * ci.quantity * 100) / 100;
        return { product: p, quantity: ci.quantity, lineTotal };
      })
      .filter(Boolean) as Array<{ product: Product; quantity: number; lineTotal: number }>;
  }, [products, cartItems]);

  const total = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);

  async function placeOrder() {
    if (placing) return;
    if (cartItems.length === 0) return setOrderResult('Cart is empty');
    setPlacing(true);
    setOrderResult(null);
    try {
      const payload = {
        customerEmail: email || undefined,
        items: cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity })),
      };
      const order = await api.createOrder(payload);
      setOrderResult(`Order placed: ${order.id} — total ${order.totalAmount}`);
    } catch (err: any) {
      setOrderResult(`Order failed: ${err?.message ?? String(err)}`);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div>Loading cart…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h1>Cart</h1>
      {lines.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Line</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.product.id}>
                  <td>{l.product.name}</td>
                  <td style={{ textAlign: 'center' }}>{l.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{l.product.currency} {l.product.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{l.product.currency} {l.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{products?.[0]?.currency ?? 'USD'} {total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ marginRight: '0.5rem' }}>Email (optional):</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>

          {orderResult && <div style={{ marginTop: '1rem' }}>{orderResult}</div>}
        </>
      )}
    </div>
  );
}
