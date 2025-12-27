# Notion Fetch Data - MCP Tool Requestor

Fetch pages and/or databases from Notion with optional search and pagination support.

## Import

```typescript
import { request as fetchNotionData } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_FETCH_DATA';
```

## Function Signature

```typescript
async function request(params: NotionFetchDataParams): Promise<NotionFetchDataResult>
```

## Parameters

### `NotionFetchDataParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `get_all` | `boolean` | No | `false` | If true, fetches both pages and databases. Only one of `get_pages`, `get_databases`, or `get_all` can be true. |
| `get_databases` | `boolean` | No | `false` | If true, fetches all databases. Only one of `get_pages`, `get_databases`, or `get_all` can be true. |
| `get_pages` | `boolean` | No | `false` | If true, fetches all pages. Only one of `get_pages`, `get_databases`, or `get_all` can be true. |
| `page_size` | `number \| null` | No | `100` | Maximum number of items to retrieve (1-100). Sets the maximum number of items returned. |
| `query` | `string \| null` | No | `null` | Optional search query to filter by title or content. |

**Important**: Exactly one of `get_pages`, `get_databases`, or `get_all` should be set to true.

## Return Value

### `NotionFetchDataResult`

```typescript
{
  object: string;                      // Typically "list"
  results: Array<Record<string, any>>; // Raw Notion objects (pages/databases)
  values: Array<Record<string, any>>;  // Simplified list with id, title, type
  has_more: boolean;                   // Whether more results are available
  next_cursor?: string | null;         // Cursor for next page (if has_more is true)
  type?: string | null;                // Object type in results (e.g., "page")
  page?: Record<string, any> | null;   // Page-specific pagination info
  data_source?: Record<string, any> | null; // Data source pagination info
}
```

## Usage Examples

### Fetch All Pages and Databases

```typescript
import { request as fetchNotionData } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_FETCH_DATA';

async function getAllNotionContent() {
  try {
    const result = await fetchNotionData({
      get_all: true,
      page_size: 50
    });
    
    console.log(`Found ${result.results.length} items`);
    console.log('Simplified values:', result.values);
    
    if (result.has_more) {
      console.log('More results available. Next cursor:', result.next_cursor);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to fetch Notion data:', error);
    throw error;
  }
}
```

### Search for Specific Pages

```typescript
import { request as fetchNotionData } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_FETCH_DATA';

async function searchNotionPages(searchQuery: string) {
  try {
    const result = await fetchNotionData({
      get_pages: true,
      query: searchQuery,
      page_size: 20
    });
    
    console.log(`Found ${result.results.length} pages matching "${searchQuery}"`);
    
    // Use the simplified values array for easier processing
    result.values.forEach(item => {
      console.log(`- ${item.title} (${item.type})`);
    });
    
    return result;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Example usage
searchNotionPages('Quarterly Report');
```

### Fetch Only Databases

```typescript
import { request as fetchNotionData } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_FETCH_DATA';

async function listNotionDatabases() {
  try {
    const result = await fetchNotionData({
      get_databases: true,
      page_size: 100
    });
    
    console.log(`Found ${result.results.length} databases`);
    
    // Access raw Notion database objects
    result.results.forEach(db => {
      console.log('Database:', db);
    });
    
    return result;
  } catch (error) {
    console.error('Failed to fetch databases:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following cases:

- **Invalid page_size**: If `page_size` is not between 1 and 100
- **MCP Response Error**: If the MCP tool returns an invalid response format
- **JSON Parse Error**: If the response cannot be parsed as JSON
- **Tool Execution Failure**: If the Notion API returns an error
- **Missing Data**: If the tool returns success but no data

```typescript
try {
  const result = await fetchNotionData({ get_all: true });
  // Process result
} catch (error) {
  if (error instanceof Error) {
    console.error('Error message:', error.message);
  }
  // Handle error appropriately
}
```

## Notes

- The function currently only fetches the first page of results
- Use `has_more` and `next_cursor` to determine if more results are available
- The `values` array provides a simplified view of results with id, title, and type
- The `results` array contains full raw Notion objects for detailed processing
- Only one of `get_pages`, `get_databases`, or `get_all` should be true at a time