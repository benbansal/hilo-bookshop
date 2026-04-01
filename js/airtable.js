/* ============================================================
   HILO BOOKSHOP — Airtable API Wrapper
   ============================================================
   Replace the two config values below with your own.
   Never commit real credentials to a public GitHub repo.
   Use Netlify environment variables for production:
     AIRTABLE_TOKEN and AIRTABLE_BASE_ID
   ============================================================ */

const AIRTABLE_TOKEN   = 'pat2W1FakhwgdOIt0';
const AIRTABLE_BASE_ID = 'appzfvlbPljtAF9FC';          
const AIRTABLE_API     = 'https://api.airtable.com/v0';

/* ============================================================
   Core fetch — handles pagination automatically
   ============================================================ */

async function airtableFetch(table, params = {}) {
  const records = [];
  let offset = null;

  do {
    const url = new URL(`${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Airtable error ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);

  return records;
}

/* ============================================================
   Books
   ============================================================ */

export async function getBooks(options = {}) {
  const params = {
    sort: JSON.stringify([{ field: 'Title', direction: 'asc' }]),
  };

  if (options.featured) {
    params.filterByFormula = `AND({Featured}=1, {In Stock}=1)`;
  } else if (options.inStock) {
    params.filterByFormula = `{In Stock}=1`;
  } else if (options.thread) {
    params.filterByFormula = `FIND("${options.thread}", ARRAYJOIN({Thread}))`;
  } else if (options.category) {
    params.filterByFormula = `{Category}="${options.category}"`;
  }

  if (options.maxRecords) params.maxRecords = options.maxRecords;

  const records = await airtableFetch('Books', params);
  return records.map(r => ({ id: r.id, ...r.fields }));
}

export async function getBook(id) {
  const res = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/Books/${id}`,
    { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Book not found: ${id}`);
  const data = await res.json();
  return { id: data.id, ...data.fields };
}

/* ============================================================
   Events
   ============================================================ */

export async function getEvents(options = {}) {
  const today = new Date().toISOString().split('T')[0];
  const params = {
    sort: JSON.stringify([{ field: 'Date', direction: 'asc' }]),
    filterByFormula: options.past
      ? `AND({Active}=1, IS_BEFORE({Date}, TODAY()))`
      : `AND({Active}=1, NOT(IS_BEFORE({Date}, TODAY())))`,
  };

  if (options.maxRecords) params.maxRecords = options.maxRecords;

  const records = await airtableFetch('Events', params);
  return records.map(r => ({ id: r.id, ...r.fields }));
}

/* ============================================================
   Objects
   ============================================================ */

export async function getObjects(options = {}) {
  const params = {
    sort: JSON.stringify([{ field: 'Name', direction: 'asc' }]),
  };

  if (options.available) {
    params.filterByFormula = `{Available}=1`;
  } else if (options.featured) {
    params.filterByFormula = `AND({Featured}=1, {Available}=1)`;
  }

  if (options.maxRecords) params.maxRecords = options.maxRecords;

  const records = await airtableFetch('Objects', params);
  return records.map(r => ({ id: r.id, ...r.fields }));
}

/* ============================================================
   Threads
   ============================================================ */

export async function getThreads(options = {}) {
  const params = {
    sort: JSON.stringify([{ field: 'Number', direction: 'asc' }]),
    filterByFormula: `{Published}=1`,
  };

  if (options.maxRecords) params.maxRecords = options.maxRecords;

  const records = await airtableFetch('Threads', params);
  return records.map(r => ({ id: r.id, ...r.fields }));
}

export async function getThread(slug) {
  const params = {
    filterByFormula: `{Slug}="${slug}"`,
    maxRecords: 1,
  };
  const records = await airtableFetch('Threads', params);
  if (!records.length) throw new Error(`Thread not found: ${slug}`);
  return { id: records[0].id, ...records[0].fields };
}

/* ============================================================
   Helpers
   ============================================================ */

export function formatPrice(price) {
  if (!price && price !== 0) return '';
  return `$${Number(price).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day:   d.toLocaleDateString('en-GB', { day: 'numeric' }),
    month: d.toLocaleDateString('en-GB', { month: 'long' }),
    year:  d.toLocaleDateString('en-GB', { year: 'numeric' }),
  };
}
