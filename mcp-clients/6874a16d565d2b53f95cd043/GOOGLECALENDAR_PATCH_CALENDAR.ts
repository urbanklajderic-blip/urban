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
 * Input parameters for patching a Google Calendar
 */
export interface PatchCalendarParams {
  /**
   * Identifier of the Google Calendar to update; use 'primary' for the main calendar or a specific ID.
   * @example "primary"
   * @example "secondaryCalendarIdAbc..."
   * @example "example@group.calendar.google.com"
   */
  calendar_id: string;

  /**
   * New description for the calendar.
   */
  description?: string | null;

  /**
   * New geographic location of the calendar (e.g., 'Paris, France').
   * @example "Paris, France"
   * @example "London"
   */
  location?: string | null;

  /**
   * New title for the calendar; cannot be an empty string.
   * @example "Team Meetings"
   * @example "Project Alpha Milestones"
   */
  summary: string;

  /**
   * New IANA Time Zone Database name for the calendar (e.g., 'Europe/Zurich', 'America/New_York').
   * @example "Europe/Zurich"
   * @example "America/New_York"
   * @example "Asia/Tokyo"
   */
  timezone?: string | null;
}

/**
 * Conference properties for a calendar
 */
interface ConferenceProperties {
  /**
   * The types of conference solutions that are allowed for the calendar. If omitted, defaults may apply based on account/domain settings.
   */
  allowedConferenceSolutionTypes: Array<'eventHangout' | 'eventNamedHangout' | 'hangoutsMeet'>;
}

/**
 * Calendar resource data returned by the Google Calendar API
 */
interface CalendarResponseData {
  /**
   * Conference-related settings for events in this calendar. Present when conference-related properties are configured or returned by the API.
   */
  conferenceProperties?: ConferenceProperties | null;

  /**
   * Description of the calendar.
   */
  description?: string | null;

  /**
   * ETag of the resource. Used for versioning and caching.
   */
  etag: string;

  /**
   * Identifier of the calendar. Commonly an email address (e.g., primary calendars) or a unique opaque ID for secondary calendars.
   */
  id: string;

  /**
   * Type of the resource. Always "calendar#calendar".
   */
  kind: 'calendar#calendar';

  /**
   * Geographic location of the calendar as free-form text.
   */
  location?: string | null;

  /**
   * Title of the calendar (display name).
   */
  summary: string;

  /**
   * The calendar's time zone, specified as an IANA time zone ID (e.g., "America/Los_Angeles").
   */
  timeZone?: string | null;
}

/**
 * Output data from patching a Google Calendar
 */
export interface PatchCalendarData {
  /**
   * Calendar resource returned by the Google Calendar API Calendars.patch method. Represents metadata for a calendar.
   */
  response_data: CalendarResponseData;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface PatchCalendarResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: PatchCalendarData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Updates (patches) metadata for a Google Calendar.
 * 
 * This function allows you to modify properties of an existing calendar such as its
 * summary (title), description, location, and timezone. Only the fields provided will
 * be updated; omitted fields remain unchanged.
 *
 * @param params - The input parameters for patching the calendar
 * @returns Promise resolving to the updated calendar data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   calendar_id: 'primary',
 *   summary: 'My Updated Calendar',
 *   timezone: 'America/New_York'
 * });
 */
export async function request(params: PatchCalendarParams): Promise<PatchCalendarData> {
  // Validate required parameters
  if (!params.calendar_id) {
    throw new Error('Missing required parameter: calendar_id');
  }
  
  if (!params.summary) {
    throw new Error('Missing required parameter: summary');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, PatchCalendarParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_PATCH_CALENDAR',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: PatchCalendarResponse;
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