/**
 * TODO (Assessment Task - Backend 2): Implement validation for POST /api/orders body.
 * Validate that req.body has:
 * - items: array of { productId: string, quantity: number }
 * - each item must have productId (non-empty string) and quantity (positive integer)
 * If invalid, respond with 400 and { error: '...' } and do not call next().
 * If valid, call next().
 */
function validateOrderBody(req, res, next) {
  const body = req.body;
  if (!body || !Array.isArray(body.items)) {
    return res.status(400).json({ error: 'Request body must have an items array' });
  }

  if (body.items.length === 0) {
    return res.status(400).json({ error: 'Items array must contain at least one item' });
  }

  for (const [i, item] of body.items.entries()) {
    if (!item || typeof item.productId !== 'string' || item.productId.trim() === '') {
      return res.status(400).json({ error: `Item at index ${i} missing valid productId` });
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: `Item at index ${i} has invalid quantity` });
    }
  }

  return next();
}

module.exports = { validateOrderBody };
