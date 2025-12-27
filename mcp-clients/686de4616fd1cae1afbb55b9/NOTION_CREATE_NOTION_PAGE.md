# Notion Create Page - Usage Guide

## Overview

This module provides a TypeScript interface for creating new pages in Notion using the MCP (Model Context Protocol) tool.

## Installation/Import

```typescript
import { request as createNotionPage } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_NOTION_PAGE';
```

## Function Signature

```typescript
async function request(params: CreateNotionPageParams): Promise<CreateNotionPageData>
```

## Parameters

### `CreateNotionPageParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `parent_id` | `string` | ✅ Yes | UUID of an existing Notion page or database (format: 8-4-4-4-12 hex characters). Use search_pages or list_databases to obtain valid IDs. |
| `title` | `string` | ✅ Yes | The title of the new page to be created. |
| `cover` | `string \| null` | ❌ No | URL of an image to be used as the page cover. Must be publicly accessible. |
| `icon` | `string \| null` | ❌ No | Single emoji character to be used as the page icon (e.g., "😻", "🤔", "📄"). |

### Important Notes on `parent_id`

- **Always use a valid UUID** (e.g., `59833787-2cf9-4fdf-8782-e53db20768a5`)
- **Cannot create root-level pages** - you must specify a parent
- Use `search_pages` or `list_databases` actions first to obtain valid parent IDs
- Common errors: malformed UUIDs, non-existent IDs, or IDs from different workspaces

## Return Value

Returns a `Promise<CreateNotionPageData>` containing:

- `id`: Unique identifier for the created page (UUIDv4)
- `url`: The URL of the Notion page
- `title`: The page title
- `created_time`: ISO 8601 datetime when the page was created
- `created_by`: User object representing who created the page
- `last_edited_time`: ISO 8601 datetime when the page was last edited
- `last_edited_by`: User object representing who last edited the page
- `parent`: Parent database information
- `properties`: Property values of the page
- `archived`: Whether the page is archived
- `in_trash`: Whether the page is in the trash
- `cover`: Cover image object (if provided)
- `icon`: Icon object (if provided)
- `public_url`: Public URL if the page is published to the web

## Usage Examples

### Basic Usage

```typescript
import { request as createNotionPage } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_NOTION_PAGE';

async function createBasicPage() {
  try {
    const result = await createNotionPage({
      parent_id: '59833787-2cf9-4fdf-8782-e53db20768a5',
      title: 'My New Report'
    });
    
    console.log('Page created:', result.url);
    console.log('Page ID:', result.id);
  } catch (error) {
    console.error('Failed to create page:', error);
  }
}
```

### With Cover and Icon

```typescript
import { request as createNotionPage } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_NOTION_PAGE';

async function createStyledPage() {
  try {
    const result = await createNotionPage({
      parent_id: '59833787-2cf9-4fdf-8782-e53db20768a5',
      title: 'Project Plan Q3',
      icon: '📊',
      cover: 'https://www.example.com/images/cover.png'
    });
    
    console.log('Styled page created:', result.url);
  } catch (error) {
    console.error('Failed to create page:', error);
  }
}
```

### Complete Example with Error Handling

```typescript
import { request as createNotionPage } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_NOTION_PAGE';

async function createPageWithFullHandling() {
  const params = {
    parent_id: '59833787-2cf9-4fdf-8782-e53db20768a5',
    title: 'Meeting Notes - 2024',
    icon: '📝'
  };

  try {
    const page = await createNotionPage(params);
    
    return {
      success: true,
      pageId: page.id,
      pageUrl: page.url,
      createdAt: page.created_time
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating Notion page:', error.message);
      
      // Handle specific error cases
      if (error.message.includes('Missing required parameter')) {
        console.error('Validation error: Check your input parameters');
      } else if (error.message.includes('Invalid MCP response')) {
        console.error('Communication error: MCP tool returned invalid response');
      } else if (error.message.includes('MCP tool execution failed')) {
        console.error('Execution error: The Notion API request failed');
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameters**: If `parent_id` or `title` is not provided
   ```
   Error: Missing required parameter: parent_id
   Error: Missing required parameter: title
   ```

2. **Invalid MCP Response**: If the MCP tool returns an invalid response format
   ```
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failure**: If the Notion API request fails
   ```
   Error: MCP tool execution failed
   Error: [specific error message from Notion API]
   ```

5. **Missing Data**: If the tool returns success but no data
   ```
   Error: MCP tool returned successful response but no data
   ```

## Best Practices

1. **Always obtain valid parent IDs** using search or list operations before creating pages
2. **Use UUIDs for parent_id** rather than page titles for reliability
3. **Validate cover URLs** are publicly accessible before passing them
4. **Use single emoji characters** for the icon parameter
5. **Implement proper error handling** to catch and handle various failure scenarios
6. **Store the returned page ID** for future reference and operations

## Environment Compatibility

This module works in both:
- ✅ Node.js server environments
- ✅ Browser environments (with appropriate CORS configuration)

## Related Operations

- Search for existing pages to get valid parent IDs
- List databases to find database IDs
- Update page properties after creation
- Add content blocks to the created page