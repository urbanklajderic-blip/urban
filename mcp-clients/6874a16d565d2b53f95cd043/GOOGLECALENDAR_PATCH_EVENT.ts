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
 * Input parameters for patching a Google Calendar event
 */
export interface PatchEventParams {
  /**
   * List of email addresses for attendees. Replaces existing attendees. Provide an empty list to remove all.
   * @example ["user1@example.com", "user2@example.com"]
   * @example []
   */
  attendees?: string[] | null;

  /**
   * Identifier of the calendar. Use 'primary' for the primary calendar of the logged-in user. 
   * To find other calendar IDs, use the `calendarList.list` method. Must be provided in snake_case format.
   * @example "primary"
   * @example "secondary_calendar_id"
   */
  calendar_id: string;

  /**
   * API client's conference data support version. Set to 1 to manage conference details (e.g., Google Meet links); 
   * 0 (default) ignores conference data.
   * @example 0
   * @example 1
   */
  conference_data_version?: number | null;

  /**
   * New description for the event; can include HTML.
   * @example "Weekly team sync meeting to discuss project updates."
   */
  description?: string | null;

  /**
   * New end time (RFC3339 timestamp, e.g., '2024-07-01T11:00:00-07:00'). 
   * Uses `timezone` if provided, otherwise UTC. For all-day events, use YYYY-MM-DD format (exclusive end date).
   * @example "2024-07-01T11:00:00-07:00"
   * @example "2024-07-02"
   */
  end_time?: string | null;

  /**
   * Identifier of the event to update. Must be provided in snake_case format.
   * @example "abc123xyz"
   */
  event_id: string;

  /**
   * New geographic location (physical address or virtual meeting link).
   * @example "Conference Room B"
   * @example "https://hangouts.google.com/foo"
   */
  location?: string | null;

  /**
   * Maximum attendees in response; does not affect invited count. If more, response includes organizer only. 
   * Must be positive.
   * @example 10
   * @example 100
   */
  max_attendees?: number | null;

  /**
   * RSVP response status for the authenticated user. Updates only the current user's response status 
   * without affecting other attendees. Possible values: 'needsAction', 'declined', 'tentative', 'accepted'.
   * @example "accepted"
   * @example "declined"
   */
  rsvp_response?: string | null;

  /**
   * Whether to send update notifications to attendees: 'all', 'externalOnly', or 'none'. 
   * Uses default user behavior if unspecified.
   * @example "all"
   * @example "externalOnly"
   */
  send_updates?: string | null;

  /**
   * New start time (RFC3339 timestamp, e.g., '2024-07-01T10:00:00-07:00'). 
   * Uses `timezone` if provided, otherwise UTC. For all-day events, use YYYY-MM-DD format.
   * @example "2024-07-01T10:00:00-07:00"
   * @example "2024-07-01"
   */
  start_time?: string | null;

  /**
   * New title for the event.
   * @example "Updated Team Meeting"
   */
  summary?: string | null;

  /**
   * Client application supports event attachments. Set to `True` if so.
   * @example true
   * @example false
   */
  supports_attachments?: boolean | null;

  /**
   * IANA Time Zone Database name for start/end times (e.g., 'America/Los_Angeles'). 
   * Used if `start_time` and `end_time` are provided and not all-day dates; defaults to UTC if unset.
   * @example "America/Los_Angeles"
   * @example "Europe/Berlin"
   */
  timezone?: string | null;
}

/**
 * Attachment file information
 */
export interface Attachment {
  /** File ID */
  fileId?: string | null;
  /** File URL */
  fileUrl?: string | null;
  /** Icon link */
  iconLink?: string | null;
  /** MIME type */
  mimeType?: string | null;
  /** Title */
  title?: string | null;
}

/**
 * Event attendee information
 */
export interface Attendee {
  /** Number of additional guests brought by the attendee */
  additionalGuests?: number | null;
  /** Response comment */
  comment?: string | null;
  /** Attendee name */
  displayName?: string | null;
  /** Attendee email address */
  email: string;
  /** Attendee profile ID */
  id?: string | null;
  /** Is optional */
  optional?: boolean | null;
  /** Is organizer */
  organizer?: boolean | null;
  /** Is the attendee a resource (e.g., a room) */
  resource?: boolean | null;
  /** Attendee response status: needsAction, declined, tentative, accepted */
  responseStatus: string;
  /** Is this the authenticated user's calendar */
  self?: boolean | null;
}

/**
 * Conference solution key
 */
export interface ConferenceSolutionKey {
  /** Solution type */
  type?: string | null;
}

/**
 * Conference solution information
 */
export interface ConferenceSolution {
  /** Icon URI */
  iconUri?: string | null;
  /** Solution key */
  key?: ConferenceSolutionKey | null;
  /** Solution name */
  name?: string | null;
}

/**
 * Conference create status
 */
export interface ConferenceCreateStatus {
  /** Create request status (pending, fulfilled, rejected) */
  statusCode?: string | null;
}

/**
 * Conference create request
 */
export interface ConferenceCreateRequest {
  /** Conference solution key */
  conferenceSolutionKey?: ConferenceSolutionKey | null;
  /** Client-specified unique request ID */
  requestId?: string | null;
  /** Create request status */
  status?: ConferenceCreateStatus | null;
}

/**
 * Conference entry point
 */
export interface ConferenceEntryPoint {
  /** Access code */
  accessCode?: string | null;
  /** Type: video, phone, sip, or more */
  entryPointType?: string | null;
  /** Display label */
  label?: string | null;
  /** Meeting code */
  meetingCode?: string | null;
  /** Passcode */
  passcode?: string | null;
  /** Password */
  password?: string | null;
  /** Phone PIN */
  pin?: string | null;
  /** Two-letter region code (ISO 3166-1 alpha-2) */
  regionCode?: string | null;
  /** URI for joining */
  uri?: string | null;
}

/**
 * Conference data information
 */
export interface ConferenceData {
  /** Identifier for the conference */
  conferenceId?: string | null;
  /** Conference solution */
  conferenceSolution?: ConferenceSolution | null;
  /** Create request */
  createRequest?: ConferenceCreateRequest | null;
  /** Entry points */
  entryPoints?: ConferenceEntryPoint[] | null;
  /** Conference notes */
  notes?: string | null;
  /** Opaque signature for validation */
  signature?: string | null;
}

/**
 * User information (creator/organizer)
 */
export interface User {
  /** Display name of the user */
  displayName?: string | null;
  /** Email address of the user */
  email: string;
  /** Profile ID, if available */
  id?: string | null;
  /** Whether this person corresponds to the calendar on which this copy of the event appears */
  self?: boolean | null;
}

/**
 * Event date/time information
 */
export interface EventDateTime {
  /** Date for all-day events (YYYY-MM-DD) */
  date?: string | null;
  /** RFC3339 date-time for timed events */
  dateTime?: string | null;
  /** Time zone for the time specified */
  timeZone?: string | null;
}

/**
 * Extended properties
 */
export interface ExtendedProperties {
  /** Private key/value properties */
  private?: Record<string, string> | null;
  /** Shared key/value properties */
  shared?: Record<string, string> | null;
}

/**
 * Focus time properties
 */
export interface FocusTimeProperties {
  /** declineNone, declineAllConflictingInvitations, declineOnlyNewConflictingInvitations */
  autoDeclineMode?: string | null;
  /** Chat status during focus time */
  chatStatus?: string | null;
  /** Message used for declined invitations */
  declineMessage?: string | null;
}

/**
 * Gadget information (deprecated)
 */
export interface Gadget {
  display?: string | null;
  height?: number | null;
  iconLink?: string | null;
  link?: string | null;
  preferences?: Record<string, string> | null;
  title?: string | null;
  type?: string | null;
  width?: number | null;
}

/**
 * Out-of-office properties
 */
export interface OutOfOfficeProperties {
  /** declineNone, declineAllConflictingInvitations, declineOnlyNewConflictingInvitations */
  autoDeclineMode?: string | null;
  /** Message used for auto-declined invitations */
  declineMessage?: string | null;
}

/**
 * Reminder override
 */
export interface ReminderOverride {
  /** Reminder method: email or popup */
  method: string;
  /** Minutes before start to trigger */
  minutes: number;
}

/**
 * Reminders information
 */
export interface Reminders {
  /** Override reminders if useDefault is false */
  overrides?: ReminderOverride[] | null;
  /** Whether the default reminders of the calendar are used */
  useDefault: boolean;
}

/**
 * Source information
 */
export interface Source {
  /** Source title */
  title?: string | null;
  /** Source URL */
  url?: string | null;
}

/**
 * Working location custom
 */
export interface WorkingLocationCustom {
  label?: string | null;
}

/**
 * Working location home office
 */
export interface WorkingLocationHomeOffice {
  label?: string | null;
}

/**
 * Working location office
 */
export interface WorkingLocationOffice {
  buildingId?: string | null;
  deskId?: string | null;
  floorId?: string | null;
  floorSectionId?: string | null;
  label?: string | null;
}

/**
 * Working location properties
 */
export interface WorkingLocationProperties {
  customLocation?: WorkingLocationCustom | null;
  homeOffice?: WorkingLocationHomeOffice | null;
  officeLocation?: WorkingLocationOffice | null;
  /** homeOffice, officeLocation, or customLocation */
  type?: string | null;
}

/**
 * Patched Google Calendar event data
 */
export interface PatchedEventData {
  /** Whether attendees other than the organizer can invite themselves */
  anyoneCanAddSelf?: boolean | null;
  /** File attachments for the event */
  attachments?: Attachment[] | null;
  /** The attendees of the event */
  attendees?: Attendee[] | null;
  /** Whether attendees were omitted from the API response */
  attendeesOmitted?: boolean | null;
  /** ID of the color used to display this event */
  colorId?: string | null;
  /** Information about conference solutions attached to the event */
  conferenceData?: ConferenceData | null;
  /** Creation time (RFC3339 timestamp) */
  created: string;
  /** Creator of the event */
  creator: User;
  /** Description of the event. May contain HTML. */
  description?: string | null;
  /** End time of the event */
  end: EventDateTime;
  /** Whether the end time is unspecified */
  endTimeUnspecified?: boolean | null;
  /** ETag of the event resource */
  etag: string;
  /** Type of the event, e.g., default, outOfOffice, focusTime, workingLocation, fromGmail */
  eventType: string;
  /** Extended properties for private and shared use */
  extendedProperties?: ExtendedProperties | null;
  /** Properties for a focus time event */
  focusTimeProperties?: FocusTimeProperties | null;
  /** Gadget attached to the event (deprecated) */
  gadget?: Gadget | null;
  /** Whether attendees can invite others */
  guestsCanInviteOthers?: boolean | null;
  /** Whether attendees other than the organizer can modify the event */
  guestsCanModify?: boolean | null;
  /** Whether attendees can see the guest list */
  guestsCanSeeOtherGuests?: boolean | null;
  /** Link to the Google Meet (deprecated in favor of conferenceData) */
  hangoutLink?: string | null;
  /** Absolute link to the Google Calendar Web UI for this event */
  htmlLink: string;
  /** Globally unique identifier as defined in RFC5545 */
  iCalUID: string;
  /** Opaque identifier of the event. Unique within a calendar. */
  id: string;
  /** Type of the resource. Always 'calendar#event'. */
  kind: string;
  /** Geographic location of the event */
  location?: string | null;
  /** Whether this event is locked and cannot be modified by attendees */
  locked?: boolean | null;
  /** Organizer of the event */
  organizer: User;
  /** Start/End/originalStartTime object */
  originalStartTime?: EventDateTime | null;
  /** Properties for an out-of-office event */
  outOfOfficeProperties?: OutOfOfficeProperties | null;
  /** Whether this is a private copy of the event */
  privateCopy?: boolean | null;
  /** List of RRULE/EXRULE/RDATE/EXDATE lines for a recurring event */
  recurrence?: string[] | null;
  /** ID of the recurring event to which this instance belongs */
  recurringEventId?: string | null;
  /** Information about the event's reminders for the authenticated user */
  reminders: Reminders;
  /** Sequence number as defined in RFC5545. Incremented on changes. */
  sequence: number;
  /** Source from which the event was created */
  source?: Source | null;
  /** Start time of the event */
  start: EventDateTime;
  /** Status of the event: confirmed, tentative, or cancelled */
  status: string;
  /** Title of the event */
  summary: string;
  /** opaque (blocks) or transparent (does not block) */
  transparency?: string | null;
  /** Last modification time (RFC3339 timestamp) */
  updated: string;
  /** Visibility of the event: default, public, private */
  visibility?: string | null;
  /** Properties for a working location event */
  workingLocationProperties?: WorkingLocationProperties | null;
  [key: string]: any;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface PatchEventResponse {
  /** Whether or not the action execution was successful or not */
  successful: boolean;
  /** Data from the action execution */
  data?: PatchedEventData;
  /** Error if any occurred during the execution of the action */
  error?: string | null;
}

/**
 * Updates an existing Google Calendar event with partial modifications.
 * Only the fields provided in the parameters will be updated; other fields remain unchanged.
 * This is useful for making targeted changes to events without needing to provide all event details.
 *
 * @param params - The input parameters for patching the event
 * @returns Promise resolving to the updated event data
 * @throws Error if required parameters (calendar_id, event_id) are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   calendar_id: 'primary',
 *   event_id: 'abc123xyz',
 *   summary: 'Updated Team Meeting',
 *   start_time: '2024-07-01T10:00:00-07:00',
 *   end_time: '2024-07-01T11:00:00-07:00'
 * });
 */
export async function request(params: PatchEventParams): Promise<PatchedEventData> {
  // Validate required parameters
  if (!params.calendar_id) {
    throw new Error('Missing required parameter: calendar_id');
  }
  if (!params.event_id) {
    throw new Error('Missing required parameter: event_id');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, PatchEventParams>(
    '6874a16d565d2b53f95cd043',
    'GOOGLECALENDAR_PATCH_EVENT',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: PatchEventResponse;
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