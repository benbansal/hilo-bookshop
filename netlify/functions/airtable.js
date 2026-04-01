// Netlify serverless function — Airtable proxy
// Credentials live in Netlify environment variables, never in code.
// Called by the frontend as: /api/airtable?table=Books&...params

exports.handler = async function(event) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Airtable credentials not configured' })
    };
  }

  // Build the Airtable URL from query params
  const params = event.queryStringParameters || {};
  const table  = params.table;

  if (!table) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing table parameter' })
    };
  }

  // Forward all params except 'table' to Airtable
  const airtableParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'table') airtableParams.set(k, v);
  });

  // Handle pagination offset
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?${airtableParams}`;

  try {
    const res  = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
