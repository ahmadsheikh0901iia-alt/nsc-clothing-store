/** Derived collections use the same rules on the homepage and collection pages. */
export function saleCut(product) {
  const was = Number(product?.compare_at_price);
  const price = Number(product?.price);
  return was > price && price > 0 ? Math.round((was - price) / was * 100) : 0;
}

export function collectionProducts(products, category, collection = '', limit = 0) {
  let rows;
  if (category === 'new-arrivals') {
    rows = [...products].sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)).slice(0, 30);
  } else if (category === 'top-sales') {
    rows = products.filter((p) => saleCut(p) > 0).sort((a, b) => saleCut(b) - saleCut(a));
  } else {
    rows = products.filter((p) => p.category === category && (!collection || p.collection === collection));
  }
  return limit > 0 ? rows.slice(0, limit) : rows;
}

export function categoryCounts(products) {
  const counts = products.reduce((result, p) => {
    result[p.category] = (result[p.category] || 0) + 1;
    return result;
  }, {});
  counts['new-arrivals'] = collectionProducts(products, 'new-arrivals').length;
  counts['top-sales'] = collectionProducts(products, 'top-sales').length;
  return counts;
}

/** Only schema errors qualify for legacy-column retries, not network errors
 * whose message happens to contain the query URL and its column names. */
export function missingColumn(error, name) {
  return ['42703', 'PGRST204'].includes(error?.code)
    && new RegExp(`\\b${name}\\b`, 'i').test(`${error.message || ''} ${error.details || ''}`);
}
