import { callMCPTool } from '@/sdk/core/mcp-client';

/**
 * MCP Response wrapper interface - MANDATORY
 * All MCP tools return responses in this wrapped format
 */
interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string; // JSON string containing actual tool data
  }>;
}

/**
 * Sort rule for ordering database query results
 */
export interface Sort {
  /**
   * Sort direction: True for ascending (A→Z, oldest→newest), False for descending (Z→A, newest→oldest).
   */
  ascending: boolean;
  /**
   * The exact name of a database property/column to sort by. Must match an existing property name in the database exactly (case-sensitive). Common properties include 'Name', 'Title', 'Created time', 'Last edited time', etc.
   */
  property_name: string;
}

/**
 * Input parameters for querying a Notion database
 */
export interface QueryDatabaseParams {
  /**
   * The UUID of the Notion database to query (32 character hexadecimal string, optionally with hyphens). The database must be shared with your integration. You can find the database ID in the database URL or use actions like `NOTION_FETCH_DATA` to list available databases. Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   */
  database_id: string;
  /**
   * Number of items (database rows/pages) to return per request. Valid range: 1-100. Default is 100. The API may return fewer items than requested if that's all that's available.
   */
  page_size?: number;
  /**
   * List of sort rules to order the database query results. Each sort rule must specify: 'property_name' (exact name of an existing database property) and 'ascending' (True/False). Properties must exist in the database and names must match exactly (case-sensitive). Multiple sorts are applied in the order specified.
   */
  sorts?: Sort[] | null;
  /**
   * A pagination cursor for fetching the next page of results. Must be a valid UUID string (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) obtained from the 'next_cursor' field of a previous query response. Do not use placeholder values. If omitted, returns the first page.
   */
  start_cursor?: string | null;
}

/**
 * External file details
 */
export interface External {
  /**
   * Link to the externally hosted content.
   */
  url: string;
}

/**
 * External cover image
 */
export interface ExternalCover {
  /**
   * External file details.
   */
  external: External;
  /**
   * Always 'external'.
   */
  type: "external";
}

/**
 * Partial user object
 */
export interface PartialUser {
  /**
   * Unique identifier for the user.
   */
  id: string;
  /**
   * Always 'user'.
   */
  object: "user";
}

/**
 * Emoji icon
 */
export interface EmojiIcon {
  /**
   * The emoji character.
   */
  emoji: string;
  /**
   * Always 'emoji'.
   */
  type: "emoji";
}

/**
 * Database parent reference
 */
export interface DatabaseParent {
  /**
   * UUID of the parent database.
   */
  database_id: string;
  /**
   * Always 'database_id'.
   */
  type: "database_id";
}

/**
 * Page object from Notion database
 */
export interface PageObject {
  /**
   * Whether the page is archived.
   */
  archived?: boolean | null;
  /**
   * Page cover image, can be an external or Notion-hosted file.
   */
  cover?: ExternalCover | null;
  /**
   * Partial user object representing the page creator.
   */
  created_by?: PartialUser | null;
  /**
   * ISO 8601 timestamp of when the page was created.
   */
  created_time?: string | null;
  /**
   * Page icon, can be an emoji or file object.
   */
  icon?: EmojiIcon | null;
  /**
   * Unique identifier for the page (UUIDv4 format).
   */
  id: string;
  /**
   * Whether the page is in trash.
   */
  in_trash?: boolean | null;
  /**
   * Partial user object representing the last editor.
   */
  last_edited_by?: PartialUser | null;
  /**
   * ISO 8601 timestamp of the most recent modification.
   */
  last_edited_time?: string | null;
  /**
   * Always 'page' for page objects.
   */
  object: "page";
  /**
   * Reference to the parent container (database, data_source, page, block, or workspace).
   */
  parent?: DatabaseParent | null;
  /**
   * Property values of the page, conforming to the parent database schema. Each property has an id, type, and type-specific value object.
   */
  properties?: Record<string, any> | null;
  /**
   * The public URL of the page if it has been published to the web, otherwise null.
   */
  public_url?: string | null;
  /**
   * The Notion URL of the page.
   */
  url?: string | null;
}

/**
 * Output data from querying a Notion database
 */
export interface QueryDatabaseData {
  /**
   * Whether there are more results available beyond the current page.
   */
  has_more: boolean;
  /**
   * Pagination cursor for retrieving the next page of results. Null if there are no more results.
   */
  next_cursor?: string | null;
  /**
   * Always 'list' for paginated responses.
   */
  object: "list";
  /**
   * Unique identifier for tracking the API request.
   */
  request_id: string;
  /**
   * Array of Page and/or Database objects matching the query criteria.
   */
  results: PageObject[];
  /**
   * The type of items in the results array, typically 'page_or_database'.
   */
  type: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface QueryDatabaseResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  /**
   * Data from the action execution
   */
  data?: QueryDatabaseData;
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Query a Notion database to retrieve pages/rows with optional sorting and pagination.
 * This tool allows you to fetch database entries, apply sort rules, and paginate through results.
 *
 * @param params - The input parameters for querying the Notion database
 * @returns Promise resolving to the query results with page objects and pagination info
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   database_id: '260beeb0-57b4-80df-acc9-c3620f730dee',
 *   page_size: 50,
 *   sorts: [{ property_name: 'Created time', ascending: false }]
 * });
 */
export async function request(params: QueryDatabaseParams): Promise<QueryDatabaseData> {
  // Validate required parameters
  if (!params.database_id) {
    throw new Error('Missing required parameter: database_id');
  }

  // Validate page_size if provided
  if (params.page_size !== undefined && (params.page_size < 1 || params.page_size > 100)) {
    throw new Error('Parameter page_size must be between 1 and 100');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, QueryDatabaseParams>(
    '686de4616fd1cae1afbb55b9',
    'NOTION_QUERY_DATABASE',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: QueryDatabaseResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }

  if (!toolData.successful) {
    throw new Error(toolData.error || 'MCP tool execution failed');
  }

  if (!toolData.data) {
    throw new Error('MCP tool returned successful response but no data');
  }

  return toolData.data;
}