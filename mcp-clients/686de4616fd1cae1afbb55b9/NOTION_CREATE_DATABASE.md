# Notion Create Database - Cheatsheet

## Overview

This module provides a TypeScript interface for creating new databases in Notion using the MCP (Model Context Protocol) tool. It allows you to programmatically create databases with custom properties (columns) as children of existing Notion pages.

## Installation/Import

```typescript
import { request as createNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';
import type { CreateDatabaseParams, CreateDatabaseData } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';
```

## Function Signature

```typescript
async function createNotionDatabase(params: CreateDatabaseParams): Promise<CreateDatabaseData>
```

## Parameters

### `CreateDatabaseParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `parent_id` | `string` | Yes | UUID of the existing Notion page that will contain the new database. Must be a valid 32-character UUID with or without hyphens. |
| `title` | `string` | Yes | The desired title for the new database. |
| `properties` | `PropertySchema[]` | Yes | Array of property definitions (columns) for the database. At least one property of type 'title' is generally required. |

### `PropertySchema`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Name of the property (column name). |
| `type` | `string` | Yes | Property type: 'title', 'rich_text', 'number', 'select', 'multi_select', 'date', 'people', 'files', 'checkbox', 'url', 'email', 'phone_number', 'formula', 'relation', 'rollup', 'status', 'created_time', 'created_by', 'last_edited_time'. |
| `database_id` | `string` | Conditional | Required when type is 'relation'. UUID of the related database. |
| `relation_type` | `string` | No | Relationship type: 'single_property' or 'dual_property'. |

## Return Value

Returns a `Promise<CreateDatabaseData>` containing:

- `id`: Unique identifier for the created database (UUID)
- `title`: Array of rich text objects representing the database title
- `url`: The URL of the database in Notion
- `properties`: Schema definition of database properties/columns
- `parent`: Parent location information
- `created_time`: ISO 8601 timestamp when created
- `last_edited_time`: ISO 8601 timestamp when last edited
- `archived`: Whether the database is archived
- `in_trash`: Whether the database is in the trash
- `is_inline`: Whether the database appears inline or as a full page
- Additional optional fields: `icon`, `cover`, `description`, `created_by`, `last_edited_by`, etc.

## Usage Examples

### Example 1: Create a Simple Task Database

```typescript
import { request as createNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';

async function createTaskDatabase() {
  try {
    const database = await createNotionDatabase({
      parent_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      title: "My Tasks",
      properties: [
        { name: "Task Name", type: "title" },
        { name: "Due Date", type: "date" },
        { name: "Status", type: "select" },
        { name: "Priority", type: "select" }
      ]
    });
    
    console.log("Database created:", database.id);
    console.log("Database URL:", database.url);
  } catch (error) {
    console.error("Failed to create database:", error);
  }
}
```

### Example 2: Create a Project Database with Relations

```typescript
import { request as createNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';

async function createProjectDatabase() {
  try {
    const database = await createNotionDatabase({
      parent_id: "278f3c83adc5819bbd39e2fae4411d97",
      title: "Project Roadmap",
      properties: [
        { name: "Feature", type: "title" },
        { name: "Status", type: "status" },
        { name: "Assignee", type: "people" },
        { name: "Details", type: "rich_text" },
        { name: "Start Date", type: "date" },
        { name: "Completed", type: "checkbox" },
        { 
          name: "Related Tasks", 
          type: "relation",
          database_id: "existing-task-database-uuid-here",
          relation_type: "single_property"
        }
      ]
    });
    
    console.log("Project database created successfully!");
    console.log("Database ID:", database.id);
    console.log("Properties:", Object.keys(database.properties));
  } catch (error) {
    console.error("Error creating project database:", error);
  }
}
```

### Example 3: Create a Content Calendar

```typescript
import { request as createNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';

async function createContentCalendar() {
  try {
    const database = await createNotionDatabase({
      parent_id: "parent-page-uuid",
      title: "Q3 Content Calendar",
      properties: [
        { name: "Content Title", type: "title" },
        { name: "Publish Date", type: "date" },
        { name: "Author", type: "people" },
        { name: "Category", type: "select" },
        { name: "Tags", type: "multi_select" },
        { name: "URL", type: "url" },
        { name: "Published", type: "checkbox" },
        { name: "Notes", type: "rich_text" }
      ]
    });
    
    return database;
  } catch (error) {
    throw new Error(`Failed to create content calendar: ${error}`);
  }
}
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameters**: If `parent_id`, `title`, or `properties` are not provided
2. **Invalid Properties Array**: If `properties` is empty or not an array
3. **Missing Property Fields**: If any property is missing required `name` or `type` fields
4. **Missing Relation Database ID**: If a property of type 'relation' doesn't include `database_id`
5. **Invalid MCP Response**: If the MCP tool returns an invalid response format
6. **JSON Parse Error**: If the response cannot be parsed as JSON
7. **Tool Execution Failure**: If the MCP tool reports unsuccessful execution
8. **No Data Returned**: If the tool succeeds but returns no data

### Error Handling Example

```typescript
import { request as createNotionDatabase } from '@/sdk/mcp-clients/686de4616fd1cae1afbb55b9/NOTION_CREATE_DATABASE';

async function safeCreateDatabase() {
  try {
    const database = await createNotionDatabase({
      parent_id: "page-uuid",
      title: "New Database",
      properties: [
        { name: "Name", type: "title" }
      ]
    });
    
    return { success: true, database };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Missing required parameter')) {
        console.error("Validation error:", error.message);
      } else if (error.message.includes('Invalid MCP response')) {
        console.error("Communication error:", error.message);
      } else {
        console.error("Unexpected error:", error.message);
      }
    }
    
    return { success: false, error };
  }
}
```

## Important Notes

1. **Parent Page Access**: The parent page must be shared with your Notion integration
2. **UUID Format**: The `parent_id` can be provided with or without hyphens (both formats are valid)
3. **Title Property**: At least one property of type 'title' is generally required for a valid database
4. **Relation Properties**: When using 'relation' type properties, the related database must also be shared with your integration
5. **Property Types**: Supported property types include: title, rich_text, number, select, multi_select, status, date, people, files, checkbox, url, email, phone_number, formula, relation, rollup, created_time, created_by, last_edited_time, last_edited_by
6. **Environment Compatibility**: This module works in both browser and Node.js environments

## Common Property Type Configurations

- **Title**: `{ name: "Name", type: "title" }` - Required for database entries
- **Text**: `{ name: "Description", type: "rich_text" }` - Multi-line text
- **Number**: `{ name: "Count", type: "number" }` - Numeric values
- **Select**: `{ name: "Status", type: "select" }` - Single selection dropdown
- **Multi-select**: `{ name: "Tags", type: "multi_select" }` - Multiple selection
- **Date**: `{ name: "Due Date", type: "date" }` - Date or date range
- **People**: `{ name: "Assignee", type: "people" }` - Notion users
- **Checkbox**: `{ name: "Done", type: "checkbox" }` - Boolean value
- **URL**: `{ name: "Link", type: "url" }` - Web links
- **Email**: `{ name: "Contact", type: "email" }` - Email addresses
- **Phone**: `{ name: "Phone", type: "phone_number" }` - Phone numbers
- **Relation**: `{ name: "Related", type: "relation", database_id: "uuid" }` - Link to another database

## TypeScript Types

The module exports the following TypeScript interfaces:

- `CreateDatabaseParams` - Input parameters interface
- `CreateDatabaseData` - Output data interface
- `PropertySchema` - Property definition interface

These types provide full IntelliSense support and compile-time type checking.