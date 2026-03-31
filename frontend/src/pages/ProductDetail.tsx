import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    api
      .getProduct(id)
      .then((p) => mounted && setProduct(p))
      .catch((err: Error) => mounted && setError(err.message || 'Failed to load product'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div>Loading product…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <div style={{ marginBottom: '1rem' }}>{product.currency} {product.price.toFixed(2)}</div>
      <p>{product.description}</p>
      <div style={{ marginTop: '1rem' }}>
        <strong>Tags:</strong> {product.tags.join(', ')}
      </div>
    </div>
  );
}
