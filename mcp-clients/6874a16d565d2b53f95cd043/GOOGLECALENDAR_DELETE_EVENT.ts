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
 * Input parameters for deleting a Google Calendar event
 */
export interface DeleteEventParams {
  /**
   * Identifier of the Google Calendar (e.g., email address, specific ID, or 'primary' for the authenticated user's main calendar) from which the event will be deleted.
   * @default "primary"
   * @example "primary"
   * @example "user@example.com"
   * @example "abcsomecalendarid@group.calendar.google.com"
   */
  calendar_id?: string;

  /**
   * Unique identifier of the event to delete, typically obtained upon event creation.
   */
  event_id: string;
}

/**
 * Response data structure for the delete event operation
 */
export interface DeleteEventData {
  /**
   * Optional convenience wrapper returned by some integrations to indicate the outcome of the delete operation. Not part of the official Google Calendar HTTP response.
   */
  response_data?: {
    /**
     * Outcome of the delete operation. 'success' indicates the event was deleted successfully.
     */
    status: 'success';
  } | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface DeleteEventResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: DeleteEventData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Deletes an event from a Google Calendar.
 *
 * This function removes a specified event from the given calendar using the event's unique identifier.
 * The calendar defaults to 'primary' (the authenticated user's main calendar) if not specified.
 *
 * @param params - The input parameters for deleting the event
 * @param params.event_id - Unique identifier of the event to delete (required)
 * @param params.calendar_id - Calendar identifier (defaults to 'primary')
 * @returns Promise resolving to the delete operation result data
 * @throws Error if event_id is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ 
 *   event_id: 'abc123eventid',
 *   calendar_id: 'primary'
 * });
 */
export async function request(params: DeleteEventParams): Promise<DeleteEventData> {
  // Validate required parameters
  if (!params.event_id) {
    throw new Error('Missing required parameter: event_id');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, DeleteEventParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_DELETE_EVENT',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: DeleteEventResponse;
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