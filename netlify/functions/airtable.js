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
  const search = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (k === 'table' || v == null || v === '') continue;

    if (k === 'sort') {
      try {
        const sortArray = JSON.parse(v);
        if (Array.isArray(sortArray)) {
          sortArray.forEach((item, i) => {
            if (item.field) search.append(`sort[${i}][field]`, item.field);
            if (item.direction) search.append(`sort[${i}][direction]`, item.direction);
          });
        }
      } catch (e) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Invalid sort parameter' })
        };
      }
    } else {
      search.append(k, v);
    }
  }

  const url = search.toString()
    ? `${airtableBase}?${search.toString()}`
    : airtableBase;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
