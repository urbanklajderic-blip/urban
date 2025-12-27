# Google Calendar Create Event - Usage Guide

## Overview

This module provides a TypeScript interface for creating events in Google Calendar through the MCP (Model Context Protocol) integration. It supports various event types including regular events, birthdays, focus time, out-of-office, and working location events.

## Installation & Import

```typescript
import { request as createCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_CREATE_EVENT';
import type { CreateEventParams, CreateEventData } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_CREATE_EVENT';
```

## Function Signature

```typescript
async function request(params: CreateEventParams): Promise<CreateEventData>
```

## Parameters

### Required Parameters

- **`start_datetime`** (string): Event start time in ISO format without timezone
  - Format: `YYYY-MM-DDTHH:MM:SS` or `YYYY-MM-DDTHH:MM`
  - Examples: `'2025-01-16T13:00:00'` or `'2025-01-16T13:00'`

### Optional Parameters

- **`calendar_id`** (string): Target calendar ID (default: `'primary'`)
- **`summary`** (string): Event title
- **`description`** (string): Event description (can contain HTML)
- **`location`** (string): Geographic location as free-form text
- **`timezone`** (string): IANA timezone name (e.g., `'America/New_York'`)
- **`event_duration_hour`** (number): Duration in hours (0-24)
- **`event_duration_minutes`** (number): Duration in minutes (0-59 only)
- **`attendees`** (string[]): List of attendee email addresses
- **`eventType`** (string): Event type - `'default'`, `'birthday'`, `'focusTime'`, `'outOfOffice'`, `'workingLocation'`
- **`transparency`** (string): `'opaque'` (busy) or `'transparent'` (available)
- **`visibility`** (string): `'default'`, `'public'`, `'private'`, or `'confidential'`
- **`recurrence`** (string[]): RRULE lines for recurring events
- **`create_meeting_room`** (boolean): Create Google Meet link (requires Workspace)
- **`guests_can_modify`** (boolean): Allow guests to modify event
- **`guestsCanInviteOthers`** (boolean): Allow guests to invite others
- **`guestsCanSeeOtherGuests`** (boolean): Allow guests to see other attendees
- **`send_updates`** (boolean): Send update notifications to attendees
- **`exclude_organizer`** (boolean): Exclude organizer from attendee list

### Special Event Type Properties

- **`birthdayProperties`**: For birthday events
- **`focusTimeProperties`**: For focus time events (requires Workspace Enterprise)
- **`outOfOfficeProperties`**: For out-of-office events
- **`workingLocationProperties`**: For working location events (requires Workspace Enterprise)

## Return Value

Returns a `Promise<CreateEventData>` containing:

```typescript
{
  response_data: {
    id: string;              // Event ID
    htmlLink: string;        // Link to event in Google Calendar
    summary: string;         // Event title
    description?: string;    // Event description
    location?: string;       // Event location
    start: EventDateTime;    // Start time
    end: EventDateTime;      // End time
    attendees?: Attendee[];  // List of attendees
    creator: Participant;    // Event creator
    organizer: Participant;  // Event organizer
    status: string;          // Event status
    // ... and many more fields
  }
}
```

## Usage Examples

### Example 1: Simple Event

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-01-20T14:00:00',
  summary: 'Team Meeting',
  description: 'Weekly team sync',
  event_duration_hour: 1,
  timezone: 'America/New_York'
});

console.log('Event created:', event.response_data.htmlLink);
```

### Example 2: Event with Attendees

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-01-21T10:00:00',
  summary: 'Project Review',
  description: 'Q1 project review meeting',
  event_duration_hour: 2,
  attendees: [
    'colleague1@example.com',
    'colleague2@example.com'
  ],
  location: 'Conference Room A',
  timezone: 'America/Los_Angeles',
  guests_can_modify: false,
  guestsCanInviteOthers: true,
  send_updates: true
});
```

### Example 3: Recurring Event

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-01-22T09:00:00',
  summary: 'Daily Standup',
  event_duration_minutes: 15,
  timezone: 'America/New_York',
  recurrence: [
    'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20251231T235959Z'
  ]
});
```

### Example 4: All-Day Event

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-01-25T00:00:00',
  summary: 'Company Holiday',
  event_duration_hour: 24,
  transparency: 'transparent',
  timezone: 'America/New_York'
});
```

### Example 5: Out-of-Office Event

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-02-01T00:00:00',
  summary: 'Vacation',
  event_duration_hour: 24,
  eventType: 'outOfOffice',
  transparency: 'transparent',
  timezone: 'America/New_York',
  outOfOfficeProperties: {
    autoDeclineMode: 'declineAllConflictingInvitations',
    declineMessage: 'I am out of office and will respond when I return.'
  }
});
```

### Example 6: Working Location Event (Requires Workspace Enterprise)

```typescript
const event = await createCalendarEvent({
  start_datetime: '2025-01-23T09:00:00',
  summary: 'Working from Home',
  event_duration_hour: 8,
  eventType: 'workingLocation',
  transparency: 'transparent',
  visibility: 'public',
  timezone: 'America/New_York',
  workingLocationProperties: {
    type: 'homeOffice',
    homeOffice: {}
  }
});
```

## Error Handling

The function throws errors in the following cases:

1. **Missing required parameters**: If `start_datetime` is not provided
2. **Invalid MCP response**: If the response format is incorrect
3. **JSON parsing errors**: If the response cannot be parsed
4. **Tool execution failure**: If the MCP tool returns an error
5. **Missing data**: If the tool returns success but no data

### Example Error Handling

```typescript
try {
  const event = await createCalendarEvent({
    start_datetime: '2025-01-20T14:00:00',
    summary: 'Important Meeting',
    timezone: 'America/New_York'
  });
  console.log('Event created successfully:', event.response_data.id);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create event:', error.message);
  }
}
```

## Important Notes

### Google Meet Integration

- **`create_meeting_room`** requires a paid Google Workspace account ($13+/month)
- Personal Gmail accounts will fail with "Invalid conference type value" error
- Alternative: Use the Google Meet REST API separately

### Event Duration

- Use `event_duration_hour` for hours (0-24)
- Use `event_duration_minutes` for minutes (0-59 ONLY)
- **Never** use 60+ minutes - increment `event_duration_hour` instead

### Recurring Events

- For recurring events, `timezone` must be specified
- Use RRULE format following RFC5545
- Supported frequencies: DAILY, WEEKLY, MONTHLY, YEARLY

### Enterprise Features

The following event types require Google Workspace Enterprise:
- `focusTime`
- `workingLocation`

### Calendar ID Format

- Use `'primary'` for the user's main calendar
- Use calendar email address for other calendars
- Examples: `'user@example.com'`, `'abcd@group.calendar.google.com'`

## Response Fields

The created event includes comprehensive information:

- **Identifiers**: `id`, `iCalUID`, `etag`
- **Links**: `htmlLink`, `hangoutLink`
- **Times**: `start`, `end`, `created`, `updated`
- **People**: `creator`, `organizer`, `attendees`
- **Content**: `summary`, `description`, `location`
- **Settings**: `visibility`, `transparency`, `status`
- **Features**: `conferenceData`, `reminders`, `attachments`
- **Recurrence**: `recurrence`, `recurringEventId`

## TypeScript Types

All interfaces are fully typed and exported:

- `CreateEventParams` - Input parameters
- `CreateEventData` - Response data
- `CalendarEvent` - Full event object
- `Attendee` - Attendee information
- `EventDateTime` - Date/time structure
- `Participant` - Creator/organizer info
- And many more supporting types

## Best Practices

1. Always specify `timezone` for clarity
2. Use semantic event titles in `summary`
3. Include relevant details in `description`
4. Set appropriate `visibility` for sensitive events
5. Use `transparency` to control calendar availability
6. Enable `send_updates` when adding attendees
7. Handle errors gracefully with try-catch blocks
8. Validate date formats before calling the function