// Netlify serverless function — Airtable proxy
// Credentials live in Netlify environment variables, never in code.

exports.handler = async function(event) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Airtable credentials not configured' })
    };
  }

  const params = event.queryStringParameters || {};
  const table = params.table;

  if (!table) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Missing table parameter' })
    };
  }

  const airtableBase = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  const queryParts = [];

  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'table') {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  });

  const url = queryParts.length
    ? `${airtableBase}?${queryParts.join('&')}`
    : airtableBase;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
