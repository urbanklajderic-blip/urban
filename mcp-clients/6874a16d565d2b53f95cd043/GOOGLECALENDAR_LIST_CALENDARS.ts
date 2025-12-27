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
 * Input parameters for listing Google calendars
 */
export interface ListCalendarsParams {
  /**
   * Maximum number of calendars to return per page. Maximum allowed value is 250.
   * @default 100
   */
  maxResults?: number;
  
  /**
   * Minimum access role the user must have for the returned calendars.
   * @default null
   */
  minAccessRole?: 'freeBusyReader' | 'owner' | 'reader' | 'writer' | null;
  
  /**
   * Token for retrieving a specific page of results from a previous list operation.
   * @default null
   */
  pageToken?: string | null;
  
  /**
   * Include calendar list entries deleted from the user's list. Deleted entries are returned with the 'deleted' field set to true. 
   * When using 'syncToken', deleted (and hidden) entries changed since the previous list are always included, and this parameter must not be set to false.
   * @default false
   */
  showDeleted?: boolean;
  
  /**
   * Include calendars hidden in the user interface. When using 'syncToken', hidden (and deleted) entries changed since the previous list are always included, 
   * and this parameter must not be set to false.
   * @default false
   */
  showHidden?: boolean;
  
  /**
   * Sync token from a previous list request's 'nextSyncToken' to retrieve only entries changed since the last sync. 
   * When provided, only 'syncToken' and optionally 'pageToken' are used; other filters are ignored. 
   * 'minAccessRole' cannot be combined with 'syncToken'.
   * @default null
   */
  syncToken?: string | null;
}

/**
 * Event reminder configuration
 */
export interface EventReminder {
  /** Reminder delivery method */
  method: 'email' | 'popup';
  
  /** Number of minutes before the event when the reminder should trigger */
  minutes: number;
}

/**
 * Calendar notification configuration
 */
export interface CalendarNotification {
  /** Notification delivery method (always email for calendar notifications) */
  method: 'email';
  
  /** Type of event that triggers the notification */
  type: 'eventCreation' | 'eventChange' | 'eventCancellation' | 'eventResponse' | 'agenda';
}

/**
 * Notification settings for a calendar
 */
export interface NotificationSettings {
  /** List of notifications configured for this calendar */
  notifications: CalendarNotification[];
}

/**
 * Conference properties for a calendar
 */
export interface ConferenceProperties {
  /** Types of conference solutions allowed for events on this calendar */
  allowedConferenceSolutionTypes: ('eventHangout' | 'eventNamedHangout' | 'hangoutsMeet')[];
}

/**
 * Calendar list entry representing a single calendar
 */
export interface CalendarListEntry {
  /** The effective access role that the authenticated user has on the calendar */
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  
  /** The main color of the calendar in hexadecimal format */
  backgroundColor?: string | null;
  
  /** The color of the calendar (as a color ID) */
  colorId?: string | null;
  
  /** Conference properties for the calendar */
  conferenceProperties?: ConferenceProperties | null;
  
  /** The default reminders that the authenticated user has for this calendar */
  defaultReminders?: EventReminder[] | null;
  
  /** Whether this calendar list entry has been deleted from the calendar list */
  deleted?: boolean | null;
  
  /** Description of the calendar */
  description?: string | null;
  
  /** ETag of the resource */
  etag?: string | null;
  
  /** The foreground color of the calendar in hexadecimal format */
  foregroundColor?: string | null;
  
  /** Whether the calendar has been hidden from the list */
  hidden?: boolean | null;
  
  /** Identifier of the calendar */
  id: string;
  
  /** Type of the resource ("calendar#calendarListEntry") */
  kind: string;
  
  /** Geographic location of the calendar as free-form text */
  location?: string | null;
  
  /** The notifications that the authenticated user is receiving for this calendar */
  notificationSettings?: NotificationSettings | null;
  
  /** Whether the calendar is the primary calendar of the authenticated user */
  primary?: boolean | null;
  
  /** Whether the calendar content shows up in the calendar UI */
  selected?: boolean | null;
  
  /** Title of the calendar */
  summary: string;
  
  /** The summary that the authenticated user has set for this calendar */
  summaryOverride?: string | null;
  
  /** The time zone of the calendar */
  timeZone?: string | null;
}

/**
 * Response data containing the list of calendars
 */
export interface ListCalendarsData {
  /** Type of the collection ("calendar#calendarList") */
  kind: string;
  
  /** ETag of the collection */
  etag?: string | null;
  
  /** Token used to retrieve the next page of results */
  nextPageToken?: string | null;
  
  /** Token to be used to retrieve only entries that have changed since this result was returned (for incremental synchronization) */
  nextSyncToken?: string | null;
  
  /** List of CalendarListEntry resources (calendars) in the user's calendar list */
  items?: CalendarListEntry[] | null;
  
  /** Array of calendar list entries the user has access to. Equivalent to 'items'. Included for compatibility with tool responses that use this field name. */
  calendars?: CalendarListEntry[] | null;
}

/**
 * Internal response wrapper interface
 */
interface ListCalendarsResponse {
  /** Whether or not the action execution was successful */
  successful: boolean;
  
  /** Data from the action execution */
  data?: ListCalendarsData;
  
  /** Error if any occurred during the execution of the action */
  error?: string | null;
}

/**
 * Lists all calendars accessible by the authenticated user from their Google Calendar account.
 * 
 * This function retrieves calendar list entries with configurable filtering options including
 * access role requirements, pagination support, and incremental synchronization capabilities.
 *
 * @param params - The input parameters for listing calendars
 * @returns Promise resolving to the calendar list data
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * // List all calendars with default settings
 * const result = await request({});
 * 
 * @example
 * // List calendars with specific access role and pagination
 * const result = await request({
 *   maxResults: 50,
 *   minAccessRole: 'writer'
 * });
 * 
 * @example
 * // Use pagination to get next page
 * const result = await request({
 *   pageToken: 'previous_page_token_here'
 * });
 */
export async function request(params: ListCalendarsParams): Promise<ListCalendarsData> {
  // No required parameters to validate for this endpoint
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, ListCalendarsParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_LIST_CALENDARS',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: ListCalendarsResponse;
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