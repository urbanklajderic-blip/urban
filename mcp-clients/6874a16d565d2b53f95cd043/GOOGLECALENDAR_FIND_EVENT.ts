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
 * Event type enumeration
 */
export type EventType = 'birthday' | 'default' | 'focusTime' | 'outOfOffice' | 'workingLocation';

/**
 * Order by options for event listing
 */
export type OrderBy = 'startTime' | 'updated';

/**
 * Input parameters for finding Google Calendar events
 */
export interface FindEventParams {
  /**
   * Identifier of the Google Calendar to query. Use 'primary' for the primary calendar of the authenticated user,
   * an email address for a specific user's calendar, or a calendar ID for other calendars.
   * @default "primary"
   * @example "primary"
   * @example "user@example.com"
   * @example "abc...@group.calendar.google.com"
   */
  calendar_id?: string;

  /**
   * Event types to include. Supported values: 'birthday', 'default', 'focusTime', 'outOfOffice', 'workingLocation'.
   * @default ["birthday", "default", "focusTime", "outOfOffice", "workingLocation"]
   */
  event_types?: EventType[];

  /**
   * Maximum number of events per page (1-2500).
   * @default 10
   */
  max_results?: number;

  /**
   * Order of events: 'startTime' (ascending by start time) or 'updated' (ascending by last modification time).
   * Note: 'startTime' requires single_events=true. Use 'updated' if you need to include recurring masters (e.g., cancelled series).
   * @example "startTime"
   * @example "updated"
   */
  order_by?: OrderBy | null;

  /**
   * Token from a previous response's `nextPageToken` to fetch the subsequent page of results.
   */
  page_token?: string | null;

  /**
   * Free-text search terms to find events. This query is matched against various event fields including summary,
   * description, location, attendees' details (displayName, email), and organizer's details.
   * @example "Project Alpha Review"
   * @example "Birthday Party"
   * @example "Q3 Planning session"
   */
  query?: string | null;

  /**
   * Include events whose status is 'cancelled'. This surfaces cancelled/deleted events, not a separate 'trash' view.
   * Behavior with recurring events: when single_events=true, only individual cancelled instances are returned
   * (the recurring master is omitted); to include cancelled recurring masters, set single_events=false.
   * If updated_min is provided, events deleted since that time are included regardless of this flag.
   */
  show_deleted?: boolean | null;

  /**
   * When true, recurring event series are expanded into their individual instances. When false, only the recurring
   * master events are returned. Note: Ordering by 'startTime' requires singleEvents=true. For large calendars,
   * it is strongly recommended to specify both timeMin and timeMax to limit the expansion window and improve performance.
   * @default true
   */
  single_events?: boolean;

  /**
   * Upper bound (exclusive) for an event's start time to filter by. Only events starting before this time are included.
   * Accepts multiple formats:
   * 1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
   * 2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
   * 3. Simple datetime string (e.g., '2024-12-06 13:00:00')
   * @example "2024-12-31T23:59:59Z"
   * @example "2025-01-01 10:00:00"
   */
  timeMax?: string | null;

  /**
   * Lower bound (exclusive) for an event's end time to filter by. Only events ending after this time are included.
   * Accepts multiple formats:
   * 1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
   * 2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
   * 3. Simple datetime string (e.g., '2024-12-06 13:00:00')
   * @example "2024-01-01T00:00:00Z"
   * @example "2024-06-15 09:00:00"
   */
  timeMin?: string | null;

  /**
   * Lower bound (exclusive) for an event's last modification time to filter by. Only events updated after this time
   * are included. When specified, events deleted since this time are also included, regardless of the `show_deleted` parameter.
   * Accepts multiple formats:
   * 1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
   * 2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
   * 3. Simple datetime string (e.g., '2024-12-06 13:00:00')
   * @example "2024-07-01T00:00:00Z"
   */
  updated_min?: string | null;
}

/**
 * Reminder override configuration
 */
export interface ReminderOverride {
  /**
   * The method used by the reminder (e.g., 'email', 'popup').
   */
  method?: string | null;

  /**
   * Number of minutes before the start of the event when the reminder should trigger.
   */
  minutes?: number | null;
}

/**
 * Event date/time information
 */
export interface EventDateTime {
  /**
   * The date, in 'yyyy-mm-dd' format, for all-day events.
   */
  date?: string | null;

  /**
   * The start/end time as a combined date-time value (RFC3339).
   */
  dateTime?: string | null;

  /**
   * The time zone for the start/end time.
   */
  timeZone?: string | null;
}

/**
 * Event participant (creator or organizer)
 */
export interface Participant {
  /**
   * The participant's name, if available.
   */
  displayName?: string | null;

  /**
   * The participant's email address.
   */
  email?: string | null;

  /**
   * The participant's Profile ID, if available.
   */
  id?: string | null;

  /**
   * Whether this participant corresponds to the calendar on which this copy of the event appears.
   */
  self?: boolean | null;
}

/**
 * Event attendee information
 */
export interface Attendee {
  /**
   * Number of additional guests the attendee is bringing.
   */
  additionalGuests?: number | null;

  /**
   * The attendee's response comment.
   */
  comment?: string | null;

  /**
   * The attendee's name, if available.
   */
  displayName?: string | null;

  /**
   * The attendee's email address.
   */
  email?: string | null;

  /**
   * The attendee's Profile ID, if available.
   */
  id?: string | null;

  /**
   * Whether the attendee is optional.
   */
  optional?: boolean | null;

  /**
   * Whether the attendee is the organizer. Read-only.
   */
  organizer?: boolean | null;

  /**
   * Whether the attendee is a resource (for example, a room). Can only be set when adding the attendee initially.
   */
  resource?: boolean | null;

  /**
   * The attendee's response status.
   */
  responseStatus?: string | null;

  /**
   * Whether this entry represents the calendar where the event appears.
   */
  self?: boolean | null;
}

/**
 * File attachment information
 */
export interface Attachment {
  /**
   * ID of the attached file. For Google Drive files, the Drive file ID. Read-only.
   */
  fileId?: string | null;

  /**
   * URL link to the attachment.
   */
  fileUrl?: string | null;

  /**
   * URL link to the attachment's icon.
   */
  iconLink?: string | null;

  /**
   * MIME type of the attachment.
   */
  mimeType?: string | null;

  /**
   * Title of the attachment.
   */
  title?: string | null;
}

/**
 * Extended properties of an event
 */
export interface ExtendedProperties {
  /**
   * Properties private to the copy of the event on this calendar. A map of string keys to string values.
   */
  private?: Record<string, string> | null;

  /**
   * Properties shared between copies of the event on other attendees' calendars. A map of string keys to string values.
   */
  shared?: Record<string, string> | null;
}

/**
 * Event source information
 */
export interface Source {
  /**
   * Title of the event source.
   */
  title?: string | null;

  /**
   * URL of the event source. Must be absolute.
   */
  url?: string | null;
}

/**
 * Event reminders configuration
 */
export interface Reminders {
  /**
   * If 'useDefault' is false, the list of reminders that override the default.
   */
  overrides?: ReminderOverride[] | null;

  /**
   * Whether the default reminders of the calendar apply to the event.
   */
  useDefault?: boolean | null;
}

/**
 * Google Calendar event object
 */
export interface GoogleCalendarEvent {
  /**
   * Whether anyone can invite themselves to the event. Deprecated.
   */
  anyoneCanAddSelf?: boolean | null;

  /**
   * File attachments for the event.
   */
  attachments?: Attachment[] | null;

  /**
   * The attendees of the event.
   */
  attendees?: Attendee[] | null;

  /**
   * Whether attendees may have been omitted from the event's representation.
   */
  attendeesOmitted?: boolean | null;

  /**
   * The color of the event. This is an ID referring to an entry in the 'eventColors' dictionary in the Colors resource.
   */
  colorId?: string | null;

  /**
   * Information about a conference attached to the event (e.g., Google Meet).
   */
  conferenceData?: Record<string, any> | null;

  /**
   * Creation time of the event (RFC3339 timestamp).
   */
  created?: string | null;

  /**
   * The creator of the event.
   */
  creator?: Participant | null;

  /**
   * Description of the event.
   */
  description?: string | null;

  /**
   * The (exclusive) end time of the event.
   */
  end?: EventDateTime | null;

  /**
   * Whether the end time is unspecified.
   */
  endTimeUnspecified?: boolean | null;

  /**
   * ETag of the resource.
   */
  etag?: string | null;

  /**
   * The type of event.
   */
  eventType?: string | null;

  /**
   * Extended properties of the event.
   */
  extendedProperties?: ExtendedProperties | null;

  /**
   * Properties for focus time events. Present when eventType='focusTime'.
   */
  focusTimeProperties?: Record<string, any> | null;

  /**
   * A gadget that extends the event. Deprecated.
   */
  gadget?: Record<string, any> | null;

  /**
   * Whether attendees other than the organizer can invite others.
   */
  guestsCanInviteOthers?: boolean | null;

  /**
   * Whether attendees other than the organizer can modify the event.
   */
  guestsCanModify?: boolean | null;

  /**
   * Whether attendees other than the organizer can see who the event's attendees are.
   */
  guestsCanSeeOtherGuests?: boolean | null;

  /**
   * An absolute link to the Google Hangout (legacy) associated with this event. Read-only.
   */
  hangoutLink?: string | null;

  /**
   * An absolute link to this event in the Google Calendar Web UI.
   */
  htmlLink?: string | null;

  /**
   * Event identifier as defined in RFC5545. Shared by all instances of a recurring event, different from 'id'.
   */
  iCalUID?: string | null;

  /**
   * Opaque identifier of the event.
   */
  id?: string | null;

  /**
   * Type of the resource. Always 'calendar#event' for an event.
   */
  kind?: string | null;

  /**
   * Geographic location of the event as free-form text.
   */
  location?: string | null;

  /**
   * Whether this is a locked event copy where no changes can be made to main event fields. Read-only.
   */
  locked?: boolean | null;

  /**
   * The organizer of the event.
   */
  organizer?: Participant | null;

  /**
   * For an instance of a recurring event, the original start time of the instance.
   */
  originalStartTime?: EventDateTime | null;

  /**
   * Properties for out-of-office events. Present when eventType='outOfOffice'.
   */
  outOfOfficeProperties?: Record<string, any> | null;

  /**
   * Whether this is a private event copy where changes are not shared with other copies on other calendars.
   */
  privateCopy?: boolean | null;

  /**
   * List of RRULE/EXRULE/EXDATE/RDATE lines for a recurring event following RFC5545.
   */
  recurrence?: string[] | null;

  /**
   * ID of the recurring event to which this instance belongs.
   */
  recurringEventId?: string | null;

  /**
   * Information about the event's reminders.
   */
  reminders?: Reminders | null;

  /**
   * Sequence number as per iCalendar.
   */
  sequence?: number | null;

  /**
   * Source from which the event was created.
   */
  source?: Source | null;

  /**
   * The (inclusive) start time of the event.
   */
  start?: EventDateTime | null;

  /**
   * Status of the event.
   */
  status?: string | null;

  /**
   * Title of the event.
   */
  summary?: string | null;

  /**
   * Whether the event blocks time on the calendar ('opaque' blocks, 'transparent' does not).
   */
  transparency?: string | null;

  /**
   * Last modification time of the event (RFC3339 timestamp).
   */
  updated?: string | null;

  /**
   * Visibility of the event.
   */
  visibility?: string | null;

  /**
   * Properties for working location events. Present when eventType='workingLocation'.
   */
  workingLocationProperties?: Record<string, any> | null;
}

/**
 * Application wrapper containing returned events and pagination tokens
 */
export interface EventDataWrapper {
  /**
   * Array of Google Calendar event objects that match the query or sync criteria.
   */
  event_data: GoogleCalendarEvent[];

  /**
   * Opaque token used to fetch the next page of results when the list is paginated. Null if there are no additional pages.
   */
  nextPageToken?: string | null;

  /**
   * Opaque token to be used for incremental synchronization on subsequent calls. Null if not provided or not applicable.
   */
  nextSyncToken?: string | null;

  /**
   * Optional informational note from the API (often empty).
   */
  note?: string | null;
}

/**
 * Output data from finding Google Calendar events
 */
export interface FindEventData {
  /**
   * The user's access role for this calendar. One of "none", "freeBusyReader", "reader", "writer", or "owner".
   */
  accessRole?: string | null;

  /**
   * The default reminders on the calendar for the authenticated user.
   */
  defaultReminders?: ReminderOverride[] | null;

  /**
   * Description of the calendar.
   */
  description?: string | null;

  /**
   * ETag of the collection.
   */
  etag?: string | null;

  /**
   * Application wrapper used in real tool responses. Contains the returned events and tokens for pagination/sync.
   */
  event_data: EventDataWrapper;

  /**
   * List of events matching the query (standard Google API response).
   */
  items?: GoogleCalendarEvent[] | null;

  /**
   * Type of the collection resource. Always "calendar#events".
   */
  kind?: string | null;

  /**
   * Token used to retrieve the next page of results.
   */
  nextPageToken?: string | null;

  /**
   * Token used at a later point in time to retrieve only the entries that have changed since this result was returned.
   */
  nextSyncToken?: string | null;

  /**
   * Title (summary) of the calendar.
   */
  summary?: string | null;

  /**
   * The time zone of the calendar.
   */
  timeZone?: string | null;

  /**
   * Last modification time of the calendar (RFC3339 timestamp).
   */
  updated?: string | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface FindEventResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: FindEventData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Find events in a Google Calendar based on various search criteria and filters.
 * 
 * This function queries a Google Calendar to retrieve events matching specified criteria such as
 * time ranges, event types, search queries, and more. It supports pagination and can expand
 * recurring events into individual instances.
 *
 * @param params - The input parameters for finding calendar events
 * @returns Promise resolving to the calendar event data including events and pagination tokens
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * // Find upcoming events in the primary calendar
 * const result = await request({
 *   calendar_id: 'primary',
 *   timeMin: '2024-01-01T00:00:00Z',
 *   timeMax: '2024-12-31T23:59:59Z',
 *   max_results: 10,
 *   single_events: true,
 *   order_by: 'startTime'
 * });
 *
 * @example
 * // Search for events with specific text
 * const result = await request({
 *   calendar_id: 'primary',
 *   query: 'Project Alpha Review',
 *   max_results: 20
 * });
 */
export async function request(params: FindEventParams): Promise<FindEventData> {
  // No required parameters to validate based on inputSchema
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, FindEventParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_FIND_EVENT',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: FindEventResponse;
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