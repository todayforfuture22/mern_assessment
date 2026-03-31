/**
 * TODO (Assessment Task - Frontend 1): Implement the product list page.
 * - Fetch products from the API (GET /api/products) when the component mounts.
 * - Show a loading state while fetching.
 * - Show an error message if the request fails.
 * - Display the list of products (name, price, and a link to the product detail page).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Product, Category } from '../types';

export default function ProductList() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sort, setSort] = useState<'none' | 'price-asc' | 'price-desc'>('none');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([productsData, categoriesData]) => {
        if (!mounted) return;
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err: Error) => mounted && setError(err.message || 'Failed to load products'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    let out = products.slice();
    if (selectedCategory && selectedCategory !== 'all') {
      out = out.filter((p) => p.categoryId === selectedCategory);
    }
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
    return out;
  }, [products, selectedCategory, sort]);

  if (loading) return <div>Loading products…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label>Category: </label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Sort: </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="none">None</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>
        </div>
      </div>

      <ul>
        {filtered.map((p) => (
          <li key={p.id} style={{ marginBottom: '0.75rem' }}>
            <Link to={`/products/${p.id}`} style={{ fontWeight: 'bold' }}>{p.name}</Link>
            <div>{p.currency} {p.price.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
