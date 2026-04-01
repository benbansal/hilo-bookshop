// airtable.js
// Frontend helper for calling the Netlify Airtable proxy

async function airtableFetch(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  });

  const url = `/.netlify/functions/airtable?${query.toString()}`;
  const res = await fetch(url);

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Invalid JSON response from Airtable proxy (${res.status})`);
  }

  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      JSON.stringify(data) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

function mapRecord(record) {
  return {
    id: record.id,
    ...record.fields
  };
}

export async function getThreads(maxRecords = 1) {
  const data = await airtableFetch({
    table: "Threads",
    sort: [
      {
        field: "Number",
        direction: "asc"
      }
    ],
    filterByFormula: "{Published}=TRUE()",
    maxRecords
  });

  return (data.records || []).map(mapRecord);
}

export async function getEvents(maxRecords = 1) {
  const data = await airtableFetch({
    table: "Events",
    sort: [
      {
        field: "Date",
        direction: "asc"
      }
    ],
    filterByFormula: "AND({Active}=TRUE(), {Date}, {Date} >= TODAY())",
    maxRecords
  });

  return (data.records || []).map(mapRecord);
}

export async function getObjects(maxRecords = 3) {
  const data = await airtableFetch({
    table: "Objects",
    sort: [
      {
        field: "Name",
        direction: "asc"
      }
    ],
    filterByFormula: "AND({Featured}=TRUE(), {Available}=TRUE())",
    maxRecords
  });

  return (data.records || []).map(mapRecord);
}

export async function getBooks(maxRecords = 4) {
  const data = await airtableFetch({
    table: "Books",
    sort: [
      {
        field: "Title",
        direction: "asc"
      }
    ],
    filterByFormula: "AND({Featured}=TRUE(), {In Stock}=TRUE())",
    maxRecords
  });

  return (data.records || []).map(mapRecord);
}
