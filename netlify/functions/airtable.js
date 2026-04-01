exports.handler = async function(event) {
    const token  = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!token || !baseId) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Airtable credentials not configured' })
        };
    }

    const params = event.queryStringParameters || {};
    const table  = params.table;

    if (!table) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing table parameter' })
        };
    }

    // 🔧 FIX 1: checkbox normalization
    if (params.filterByFormula) {
        params.filterByFormula = params.filterByFormula
            .replace(/=\s*1/g, '=TRUE()')
            .replace(/=\s*0/g, '=FALSE()');
    }

    // 🔧 FIX 2: fix invalid IS_BEFORE formula (Events table)
    if (params.filterByFormula && params.filterByFormula.includes('IS_BEFORE')) {
        params.filterByFormula = params.filterByFormula
            .replace(/NOT\s*\(\s*IS_BEFORE\s*\(\s*\{Date\}\s*,\s*TODAY\(\)\s*\)\s*\)/g, '{Date} >= TODAY()');
    }

    // Build Airtable URL
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
        const res  = await fetch(url, {
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
            body: JSON.stringify({ error: err.message })
        };
    }
};
