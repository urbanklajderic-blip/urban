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
 * Properties for birthday events
 */
export interface BirthdayProperties {
  /**
   * Contact ID in format 'people/c12345' from Google People API. REQUIRED when type is not 'birthday'.
   */
  contact?: string | null;
  /**
   * Custom type name when type is 'other'. Requires valid contact field.
   */
  customTypeName?: string | null;
  /**
   * Type of birthday event: 'birthday', 'anniversary', or 'other'. Default 'birthday' works without contact field.
   */
  type?: 'birthday' | 'anniversary' | 'other' | null;
}

/**
 * Properties for focusTime events. REQUIRES Google Workspace Enterprise account with Focus Time feature enabled.
 */
export interface FocusTimeProperties {
  /**
   * Auto decline mode: 'declineNone' (no invitations declined), 'declineAllConflictingInvitations' (all conflicting invitations declined), or 'declineOnlyNewConflictingInvitations' (only new conflicting invitations declined).
   */
  autoDeclineMode?: 'declineNone' | 'declineAllConflictingInvitations' | 'declineOnlyNewConflictingInvitations' | null;
  /**
   * Chat status during focus time: 'active' or 'doNotDisturb'.
   */
  chatStatus?: 'active' | 'doNotDisturb' | null;
  /**
   * Message to include in declined meeting invitations. Only used when autoDeclineMode is set.
   */
  declineMessage?: string | null;
}

/**
 * Properties for outOfOffice events
 */
export interface OutOfOfficeProperties {
  /**
   * Auto decline mode: 'declineNone' (no invitations declined), 'declineAllConflictingInvitations' (all conflicting invitations declined), or 'declineOnlyNewConflictingInvitations' (only new conflicting invitations declined).
   */
  autoDeclineMode?: 'declineNone' | 'declineAllConflictingInvitations' | 'declineOnlyNewConflictingInvitations' | null;
  /**
   * Message to include in declined meeting invitations. Only used when autoDeclineMode is set.
   */
  declineMessage?: string | null;
}

/**
 * Custom working location with a display label
 */
export interface WorkingLocationCustom {
  /**
   * Label for a custom working location (e.g., 'Client site').
   */
  label: string;
}

/**
 * Empty object marker for home office working location.
 * This is used to indicate the user is working from home.
 * Google Calendar API accepts an empty object for this field.
 */
export interface WorkingLocationHomeOffice {
  // Empty object
}

/**
 * Office-based working location details
 */
export interface WorkingLocationOffice {
  /**
   * Optional building identifier from org Resources.
   */
  buildingId?: string | null;
  /**
   * Optional desk identifier.
   */
  deskId?: string | null;
  /**
   * Optional floor identifier.
   */
  floorId?: string | null;
  /**
   * Optional floor section identifier.
   */
  floorSectionId?: string | null;
  /**
   * Office name displayed in Calendar clients (e.g., building name).
   */
  label?: string | null;
}

/**
 * Properties for workingLocation events. REQUIRES Google Workspace Enterprise.
 * 
 * Constraints discovered from testing:
 * - Must set transparency='transparent' and visibility='public'
 * - Description must be omitted
 * - Depending on 'type', include one of 'homeOffice', 'officeLocation', or 'customLocation'
 */
export interface WorkingLocationProperties {
  /**
   * Custom working location with a display label.
   */
  customLocation?: WorkingLocationCustom | null;
  /**
   * Empty object marker for home office working location.
   */
  homeOffice?: WorkingLocationHomeOffice | null;
  /**
   * Office-based working location details.
   */
  officeLocation?: WorkingLocationOffice | null;
  /**
   * Type of working location ('homeOffice' | 'officeLocation' | 'customLocation').
   */
  type: 'homeOffice' | 'officeLocation' | 'customLocation';
}

/**
 * Input parameters for creating a Google Calendar event
 */
export interface CreateEventParams {
  /**
   * List of attendee emails (strings).
   */
  attendees?: string[] | null;
  /**
   * Properties for birthday events.
   */
  birthdayProperties?: BirthdayProperties | null;
  /**
   * Target calendar: 'primary' for the user's main calendar, or the calendar's email address. Must be provided in snake_case format.
   */
  calendar_id?: string;
  /**
   * If true, a Google Meet link is created and added to the event. CRITICAL: As of 2024, this REQUIRES a paid Google Workspace account ($13+/month). Personal Gmail accounts will fail with 'Invalid conference type value' error. Solutions: 1) Upgrade to Workspace, 2) Use domain-wide delegation with Workspace user, 3) Use the new Google Meet REST API, or 4) Create events without conferences. See https://github.com/googleapis/google-api-nodejs-client/issues/3234
   */
  create_meeting_room?: boolean | null;
  /**
   * Description of the event. Can contain HTML. Optional.
   */
  description?: string | null;
  /**
   * Type of the event, immutable post-creation. Supported types: 'birthday' (all-day with annual recurrence), 'default' (regular event), 'focusTime' (REQUIRES Google Workspace Enterprise), 'outOfOffice' (out-of-office event), 'workingLocation' (REQUIRES Google Workspace Enterprise). Note: 'fromGmail' events cannot be created via API.
   */
  eventType?: 'birthday' | 'default' | 'focusTime' | 'outOfOffice' | 'workingLocation';
  /**
   * Number of hours (0-24). Increase by 1 here rather than passing 60 in `event_duration_minutes`
   */
  event_duration_hour?: number;
  /**
   * Duration in minutes (0-59 ONLY). NEVER use 60+ minutes - use event_duration_hour=1 instead. Maximum value is 59.
   */
  event_duration_minutes?: number;
  /**
   * If True, the organizer will NOT be added as an attendee. Default is False (organizer is included).
   */
  exclude_organizer?: boolean;
  /**
   * Properties for focusTime events. REQUIRES Google Workspace Enterprise account with Focus Time feature enabled.
   */
  focusTimeProperties?: FocusTimeProperties | null;
  /**
   * Whether attendees other than the organizer can invite others to the event.
   */
  guestsCanInviteOthers?: boolean | null;
  /**
   * Whether attendees other than the organizer can see who the event's attendees are.
   */
  guestsCanSeeOtherGuests?: boolean | null;
  /**
   * If True, guests can modify the event.
   */
  guests_can_modify?: boolean;
  /**
   * Geographic location of the event as free-form text.
   */
  location?: string | null;
  /**
   * Properties for outOfOffice events.
   */
  outOfOfficeProperties?: OutOfOfficeProperties | null;
  /**
   * List of RRULE, EXRULE, RDATE, EXDATE lines for recurring events. Supported frequencies: DAILY, WEEKLY, MONTHLY, YEARLY. For recurring events, start.timeZone and end.timeZone must be present. Provide an empty list to remove recurrence so the event becomes non-recurring.
   */
  recurrence?: string[] | null;
  /**
   * Defaults to True. Whether to send updates to the attendees.
   */
  send_updates?: boolean | null;
  /**
   * Event start time in ISO format without timezone. Format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM (seconds optional). Examples: '2025-01-16T13:00:00' or '2025-01-16T13:00'. Timezone info (Z, +, -) will be automatically stripped if provided.
   */
  start_datetime: string;
  /**
   * Summary (title) of the event.
   */
  summary?: string | null;
  /**
   * IANA timezone name (e.g., 'America/New_York'). Required if datetime is naive. For recurring events, start and end must include a timeZone. If not provided, UTC is used. If datetime includes timezone info (Z or offset), this field is optional and defaults to UTC.
   */
  timezone?: string | null;
  /**
   * 'opaque' (busy) or 'transparent' (available).
   */
  transparency?: 'opaque' | 'transparent';
  /**
   * Event visibility: 'default', 'public', 'private', or 'confidential'.
   */
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  /**
   * Properties for workingLocation events. REQUIRES Google Workspace Enterprise.
   */
  workingLocationProperties?: WorkingLocationProperties | null;
}

/**
 * File attachment for an event
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
 * Extended properties of the event
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
 * Reminder override information
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
 * Event reminders information
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
 * Created Google Calendar event resource (calendar#event)
 */
export interface CalendarEvent {
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
 * Response data containing the created calendar event
 */
export interface CreateEventData {
  /**
   * Created Google Calendar event resource (calendar#event).
   */
  response_data: CalendarEvent;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateEventResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  /**
   * Data from the action execution
   */
  data?: CreateEventData;
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Creates a new event in Google Calendar with comprehensive configuration options.
 * 
 * Supports various event types including regular events, birthdays, focus time, 
 * out-of-office, and working location events. Can configure attendees, recurrence,
 * reminders, visibility, and more.
 *
 * @param params - The input parameters for creating the calendar event
 * @returns Promise resolving to the created calendar event data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   start_datetime: '2025-01-20T14:00:00',
 *   summary: 'Team Meeting',
 *   description: 'Weekly sync meeting',
 *   event_duration_hour: 1,
 *   attendees: ['colleague@example.com'],
 *   timezone: 'America/New_York'
 * });
 */
export async function request(params: CreateEventParams): Promise<CreateEventData> {
  // Validate required parameters
  if (!params.start_datetime) {
    throw new Error('Missing required parameter: start_datetime');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateEventParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_CREATE_EVENT',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: CreateEventResponse;
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