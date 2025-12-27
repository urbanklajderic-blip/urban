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
 * Input parameters for creating a Notion page
 */
export interface CreateNotionPageParams {
  /**
   * The URL of an image to be used as the cover for the new page. The URL must be publicly accessible.
   * @example "https://www.example.com/images/cover.png"
   */
  cover?: string | null;

  /**
   * An emoji to be used as the icon for the new page. Must be a single emoji character.
   * @example "😻", "🤔", "📄"
   */
  icon?: string | null;

  /**
   * CRITICAL: Must be either: 1) A valid UUID (format: 8-4-4-4-12 hex characters like '59833787-2cf9-4fdf-8782-e53db20768a5') of an existing Notion page or database. 2) The exact title of an existing page/database (less reliable - UUID strongly preferred). IMPORTANT: Always use search_pages or list_databases actions FIRST to obtain valid parent IDs. Common errors: Using malformed UUIDs, non-existent IDs, or IDs from different workspaces. Note: Root-level pages cannot be created - you must specify a parent.
   * @example "59833787-2cf9-4fdf-8782-e53db20768a5", "My Project Database"
   */
  parent_id: string;

  /**
   * The title of the new page to be created.
   * @example "My new report", "Project Plan Q3"
   */
  title: string;
}

/**
 * External file object
 */
interface ExternalFile {
  /**
   * External URL of the file.
   */
  url: string;
}

/**
 * Notion-hosted file object
 */
interface NotionHostedFile {
  /**
   * Authenticated URL to access the file (valid for 1 hour).
   */
  url: string;

  /**
   * ISO 8601 datetime when the URL expires.
   */
  expiry_time: string;
}

/**
 * API-uploaded file object
 */
interface FileUpload {
  /**
   * UUID of the completed file upload.
   */
  id: string;
}

/**
 * Page cover image as a file object
 */
interface CoverObject {
  /**
   * Type of cover: 'external', 'file', or 'file_upload'.
   */
  type: string;

  /**
   * External file object.
   */
  external?: ExternalFile | null;

  /**
   * Notion-hosted file object.
   */
  file?: NotionHostedFile | null;

  /**
   * API-uploaded file object.
   */
  file_upload?: FileUpload | null;
}

/**
 * Custom emoji object
 */
interface CustomEmoji {
  /**
   * Unique identifier for the custom emoji.
   */
  id: string;

  /**
   * Display name of the custom emoji.
   */
  name: string;

  /**
   * URL of the custom emoji image.
   */
  url: string;
}

/**
 * Page icon, can be an emoji or file object
 */
interface IconObject {
  /**
   * Type of icon: 'emoji', 'custom_emoji', 'external', 'file', or 'file_upload'.
   */
  type: string;

  /**
   * Emoji character when type is 'emoji'.
   */
  emoji?: string | null;

  /**
   * Custom emoji object.
   */
  custom_emoji?: CustomEmoji | null;

  /**
   * External file object.
   */
  external?: ExternalFile | null;

  /**
   * Notion-hosted file object.
   */
  file?: NotionHostedFile | null;

  /**
   * API-uploaded file object.
   */
  file_upload?: FileUpload | null;
}

/**
 * User object
 */
interface UserObject {
  /**
   * Always 'user'.
   */
  object: string;

  /**
   * Unique identifier for the user.
   */
  id: string;
}

/**
 * Parent is a database
 */
interface DatabaseParent {
  /**
   * Type of parent.
   */
  type: "database_id";

  /**
   * UUID of the parent database.
   */
  database_id: string;
}

/**
 * Output data for a created Notion page
 */
export interface CreateNotionPageData {
  /**
   * Always 'page'.
   */
  object: string;

  /**
   * Unique identifier for the page in UUIDv4 format.
   */
  id: string;

  /**
   * Date and time when this page was created, formatted as an ISO 8601 datetime string.
   */
  created_time: string;

  /**
   * User object representing who created the page.
   */
  created_by: UserObject;

  /**
   * Date and time when this page was last edited, formatted as an ISO 8601 datetime string.
   */
  last_edited_time: string;

  /**
   * User object representing who last edited the page.
   */
  last_edited_by: UserObject;

  /**
   * Whether the page is archived.
   */
  archived: boolean;

  /**
   * Whether the page is in the trash.
   */
  in_trash: boolean;

  /**
   * Parent is a database.
   */
  parent: DatabaseParent;

  /**
   * Property values of the page. Structure depends on the parent data source schema or contains only title if parent is a page.
   */
  properties: Record<string, any>;

  /**
   * The URL of the Notion page.
   */
  url: string;

  /**
   * Page cover image as a file object.
   */
  cover?: CoverObject | null;

  /**
   * Page icon, can be an emoji or file object.
   */
  icon?: IconObject | null;

  /**
   * The publicly accessible URL if the page has been published to the web, otherwise null.
   */
  public_url?: string | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateNotionPageResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: CreateNotionPageData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Creates a new page in Notion with the specified title, parent, and optional cover/icon.
 *
 * @param params - The input parameters for creating a Notion page
 * @returns Promise resolving to the created Notion page data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   parent_id: '59833787-2cf9-4fdf-8782-e53db20768a5',
 *   title: 'My new report',
 *   icon: '📄'
 * });
 */
export async function request(params: CreateNotionPageParams): Promise<CreateNotionPageData> {
  // Validate required parameters
  if (!params.parent_id) {
    throw new Error('Missing required parameter: parent_id');
  }
  
  if (!params.title) {
    throw new Error('Missing required parameter: title');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateNotionPageParams>(
    '686de4616fd1cae1afbb55b9',
    'NOTION_CREATE_NOTION_PAGE',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CreateNotionPageResponse;
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