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
 * Input parameters for retrieving a Google Calendar
 */
export interface GetCalendarParams {
  /**
   * Identifier of the Google Calendar to retrieve. 'primary' (the default) represents the user's main calendar; other valid identifiers include the calendar's email address.
   * @default "primary"
   * @example "primary"
   * @example "user@example.com"
   * @example "en.usa#holiday@group.v.calendar.google.com"
   */
  calendar_id?: string;
}

/**
 * Conference properties for a calendar
 */
export interface ConferenceProperties {
  /**
   * The types of conference solutions supported for this calendar. Read-only. Possible values include: 'eventHangout', 'eventNamedHangout', 'hangoutsMeet'.
   */
  allowedConferenceSolutionTypes: Array<'eventHangout' | 'eventNamedHangout' | 'hangoutsMeet'>;
}

/**
 * Calendar resource data as returned by the Google Calendar API
 */
export interface CalendarData {
  /**
   * Type of the resource. Always 'calendar#calendar'. Read-only.
   */
  kind: string;
  
  /**
   * ETag of the resource. Used for caching and concurrency control. Read-only.
   */
  etag: string;
  
  /**
   * Identifier of the calendar, typically an email-like value (e.g., the calendar's primary email address). Read-only.
   */
  id: string;
  
  /**
   * Title or display name of the calendar.
   */
  summary: string;
  
  /**
   * Description of the calendar. Optional.
   */
  description?: string | null;
  
  /**
   * Geographic location of the calendar as free-form text. Optional.
   */
  location?: string | null;
  
  /**
   * The time zone of the calendar, specified as an IANA Time Zone Database name (e.g., 'Europe/Zurich', 'America/Denver', 'Asia/Kolkata'). Optional.
   */
  timeZone?: string | null;
  
  /**
   * Conferencing properties for this calendar. Read-only.
   */
  conferenceProperties?: ConferenceProperties | null;
}

/**
 * Output data containing calendar information
 */
export interface GetCalendarData {
  /**
   * Calendar resource data as returned by the Google Calendar API. This object includes fields such as kind, etag, id, summary, description, location, timeZone, and conferenceProperties.
   */
  calendar_data: CalendarData;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface GetCalendarResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  
  /**
   * Data from the action execution
   */
  data?: GetCalendarData;
  
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Retrieves metadata for a Google Calendar by its identifier.
 * 
 * This function fetches calendar details including the calendar's title, description,
 * location, time zone, and conference properties. Use 'primary' to retrieve the user's
 * main calendar, or provide a specific calendar ID (email address).
 *
 * @param params - The input parameters for retrieving the calendar
 * @returns Promise resolving to the calendar data
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * const result = await request({ calendar_id: 'primary' });
 * console.log(result.calendar_data.summary); // Calendar title
 * console.log(result.calendar_data.timeZone); // Calendar timezone
 */
export async function request(params: GetCalendarParams): Promise<GetCalendarData> {
  // No required parameters to validate - calendar_id has a default value
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, GetCalendarParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_GET_CALENDAR',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: GetCalendarResponse;
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