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
 * Input parameters for finding free slots in Google Calendar
 */
export interface FindFreeSlotsParams {
  /**
   * Maximum calendars for which FreeBusy information is provided. Max allowed: 50.
   * @default 50
   */
  calendar_expansion_max?: number;

  /**
   * Maximum calendar identifiers to return for a single group; exceeding this causes an error. Max allowed: 100.
   * @default 100
   */
  group_expansion_max?: number;

  /**
   * List of calendar identifiers to query for free/busy information. Each item must be a valid calendar identifier: 'primary', a user/calendar email (e.g., user@example.com), or a calendar ID ending with a Google Calendar domain (e.g., ...@group.calendar.google.com). All identifiers are validated; if any is invalid or not found, the action returns an error.
   * @default ["primary"]
   * @example ["primary", "user@example.com", "unique_calendar_id@group.calendar.google.com"]
   */
  items?: string[];

  /**
   * End datetime for the query interval. Accepts ISO, comma-separated, or simple datetime formats. If provided without an explicit timezone, it is interpreted in the specified `timezone`.
   * @example "2024-12-06T18:00:00Z", "2024,12,06,18,00,00", "2024-12-06 18:00:00"
   */
  time_max?: string | null;

  /**
   * Start datetime for the query interval. Accepts ISO, comma-separated, or simple datetime formats. If provided without an explicit timezone, it is interpreted in the specified `timezone`.
   * @example "2024-12-06T13:00:00Z", "2024,12,06,13,00,00", "2024-12-06 13:00:00"
   */
  time_min?: string | null;

  /**
   * IANA timezone identifier (e.g., 'America/New_York', 'Europe/London'). Determines how naive `time_min`/`time_max` are interpreted and the timezone used in the response for `timeMin`, `timeMax`, busy periods, and calculated free slots.
   * @default "UTC"
   * @example "UTC", "America/New_York", "Europe/Berlin"
   */
  timezone?: string;
}

/**
 * Represents a busy time period in a calendar
 */
export interface BusyPeriod {
  /**
   * Start timestamp of the busy period in ISO 8601 format.
   */
  start: string;

  /**
   * End timestamp of the busy period in ISO 8601 format.
   */
  end: string;
}

/**
 * Represents a free time period in a calendar
 */
export interface FreePeriod {
  /**
   * Start timestamp of the free period in ISO 8601 format.
   */
  start: string;

  /**
   * End timestamp of the free period in ISO 8601 format.
   */
  end: string;
}

/**
 * Free/busy information for a single calendar within the requested time window
 */
export interface CalendarWindow {
  /**
   * List of busy time ranges for the calendar within [timeMin, timeMax].
   */
  busy?: BusyPeriod[];

  /**
   * List of computed free time ranges (complement of busy periods) within [timeMin, timeMax].
   */
  free?: FreePeriod[];
}

/**
 * Output data containing free/busy information for queried calendars
 */
export interface FindFreeSlotsData {
  /**
   * Resource type identifier. Always 'calendar#freeBusy' for free/busy queries.
   */
  kind: string;

  /**
   * Inclusive start of the query window in ISO 8601 format.
   */
  timeMin: string;

  /**
   * Exclusive end of the query window in ISO 8601 format.
   */
  timeMax: string;

  /**
   * Map of calendar identifiers to their free/busy information within the requested window. Optional to accommodate observed responses where this key may be absent.
   */
  calendars?: Record<string, CalendarWindow> | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface FindFreeSlotsResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: FindFreeSlotsData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Finds free time slots in Google Calendar by querying free/busy information for specified calendars.
 * Returns busy periods and computed free periods within the requested time window.
 *
 * @param params - The input parameters for finding free slots
 * @returns Promise resolving to free/busy data for the queried calendars
 * @throws Error if the tool execution fails or returns invalid data
 *
 * @example
 * const result = await request({
 *   items: ['primary', 'user@example.com'],
 *   time_min: '2024-12-06T13:00:00Z',
 *   time_max: '2024-12-06T18:00:00Z',
 *   timezone: 'America/New_York'
 * });
 */
export async function request(params: FindFreeSlotsParams): Promise<FindFreeSlotsData> {
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, FindFreeSlotsParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_FIND_FREE_SLOTS',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: FindFreeSlotsResponse;
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