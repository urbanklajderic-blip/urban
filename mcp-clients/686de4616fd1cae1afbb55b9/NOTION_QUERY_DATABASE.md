# Notion Query Database - Usage Guide

## Overview

This module provides a TypeScript interface for querying Notion databases through the MCP (Model Context Protocol). It allows you to retrieve pages from a database with optional sorting and pagination support.

## Installation/Import

```typescript
import { request as queryNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_QUERY_DATABASE';
```

## Function Signature

```typescript
async function request(params: QueryDatabaseParams): Promise<QueryDatabaseData>
```

## Parameters

### `QueryDatabaseParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `database_id` | `string` | ✓ | The UUID of the Notion database to query (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) |
| `page_size` | `number` | ✗ | Number of items to return per request (1-100, default: 100) |
| `sorts` | `Sort[]` | ✗ | Array of sort rules to order results |
| `start_cursor` | `string` | ✗ | Pagination cursor from previous response for fetching next page |

### `Sort` Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `property_name` | `string` | ✓ | Exact name of database property to sort by (case-sensitive) |
| `ascending` | `boolean` | ✓ | `true` for ascending (A→Z), `false` for descending (Z→A) |

## Return Value

### `QueryDatabaseData`

The function returns a promise that resolves to an object containing:

- `results`: Array of `PageObject` items from the database
- `has_more`: Boolean indicating if more results are available
- `next_cursor`: String cursor for fetching next page (null if no more results)
- `object`: Always "list" for paginated responses
- `request_id`: Unique identifier for tracking the API request
- `type`: Type of items in results array

### `PageObject` Properties

Each page object includes:
- `id`: Unique page identifier
- `object`: Always "page"
- `properties`: Property values conforming to database schema
- `created_time`: ISO 8601 timestamp
- `last_edited_time`: ISO 8601 timestamp
- `url`: Notion URL of the page
- `archived`: Whether page is archived
- `icon`: Page icon (emoji or file)
- `cover`: Page cover image
- And more...

## Usage Examples

### Basic Query

```typescript
import { request as queryNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_QUERY_DATABASE';

async function getPages() {
  try {
    const result = await queryNotionDatabase({
      database_id: '260beeb0-57b4-80df-acc9-c3620f730dee'
    });
    
    console.log(`Found ${result.results.length} pages`);
    console.log(`Has more: ${result.has_more}`);
    
    result.results.forEach(page => {
      console.log(`Page ID: ${page.id}`);
      console.log(`Properties:`, page.properties);
    });
  } catch (error) {
    console.error('Failed to query database:', error);
  }
}
```

### Query with Sorting and Pagination

```typescript
async function getPagesSorted() {
  try {
    const result = await queryNotionDatabase({
      database_id: '1bc5287fa43f80d1bfc8f0b428eedb89',
      page_size: 25,
      sorts: [
        { property_name: 'Priority', ascending: true },
        { property_name: 'Due Date', ascending: true }
      ]
    });
    
    console.log(`Retrieved ${result.results.length} pages`);
    
    // If there are more results, fetch next page
    if (result.has_more && result.next_cursor) {
      const nextPage = await queryNotionDatabase({
        database_id: '1bc5287fa43f80d1bfc8f0b428eedb89',
        page_size: 25,
        start_cursor: result.next_cursor,
        sorts: [
          { property_name: 'Priority', ascending: true },
          { property_name: 'Due Date', ascending: true }
        ]
      });
      
      console.log(`Next page has ${nextPage.results.length} pages`);
    }
  } catch (error) {
    console.error('Failed to query database:', error);
  }
}
```

### Paginate Through All Results

```typescript
async function getAllPages(databaseId: string) {
  const allPages: PageObject[] = [];
  let cursor: string | null = null;
  let hasMore = true;
  
  while (hasMore) {
    const result = await queryNotionDatabase({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor || undefined
    });
    
    allPages.push(...result.results);
    hasMore = result.has_more;
    cursor = result.next_cursor || null;
  }
  
  console.log(`Retrieved total of ${allPages.length} pages`);
  return allPages;
}
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameters**: If `database_id` is not provided
2. **Invalid Page Size**: If `page_size` is outside the range 1-100
3. **MCP Response Errors**: If the MCP tool returns an error or invalid response format
4. **JSON Parsing Errors**: If the response cannot be parsed
5. **Tool Execution Failures**: If the Notion API returns an error

### Error Handling Example

```typescript
try {
  const result = await queryNotionDatabase({
    database_id: 'invalid-id'
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Missing required parameter')) {
      console.error('Required parameter missing:', error.message);
    } else if (error.message.includes('Invalid MCP response')) {
      console.error('MCP communication error:', error.message);
    } else if (error.message.includes('Failed to parse')) {
      console.error('Response parsing error:', error.message);
    } else {
      console.error('Tool execution failed:', error.message);
    }
  }
}
```

## Notes

- The database must be shared with your Notion integration
- Property names in sort rules are case-sensitive and must match exactly
- The `start_cursor` must be obtained from a previous query response
- Maximum page size is 100 items per request
- Page properties structure varies based on the database schema