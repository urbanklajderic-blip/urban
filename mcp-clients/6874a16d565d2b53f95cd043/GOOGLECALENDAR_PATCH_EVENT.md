# Google Calendar Patch Event - Cheatsheet

## Overview

This module provides a TypeScript interface to update existing Google Calendar events with partial modifications using the MCP (Model Context Protocol) Google Calendar integration.

## Installation/Import

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';
```

## Function Signature

```typescript
async function request(params: PatchEventParams): Promise<PatchedEventData>
```

## Parameters

### Required Parameters

- **`calendar_id`** (string): Calendar identifier. Use `'primary'` for the user's primary calendar or a specific calendar ID.
- **`event_id`** (string): The unique identifier of the event to update.

### Optional Parameters

- **`summary`** (string): New title for the event
- **`description`** (string): New description (can include HTML)
- **`location`** (string): Geographic location or meeting link
- **`start_time`** (string): New start time (RFC3339 format like `'2024-07-01T10:00:00-07:00'` or `'2024-07-01'` for all-day)
- **`end_time`** (string): New end time (RFC3339 format)
- **`timezone`** (string): IANA timezone name (e.g., `'America/Los_Angeles'`)
- **`attendees`** (string[]): List of attendee email addresses (replaces existing attendees)
- **`rsvp_response`** (string): User's RSVP status (`'accepted'`, `'declined'`, `'tentative'`, `'needsAction'`)
- **`send_updates`** (string): Notification behavior (`'all'`, `'externalOnly'`, `'none'`)
- **`conference_data_version`** (number): Set to `1` to manage conference details (Google Meet), `0` to ignore
- **`max_attendees`** (number): Maximum attendees to include in response
- **`supports_attachments`** (boolean): Whether client supports attachments

## Return Value

Returns a `Promise<PatchedEventData>` containing the complete updated event information including:

- Event metadata (id, etag, kind, htmlLink)
- Timing information (start, end, created, updated)
- Event details (summary, description, location)
- Attendee information
- Conference data (Google Meet links, etc.)
- Reminders and recurrence rules
- And more...

## Usage Examples

### Example 1: Update Event Title and Time

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';

async function updateMeeting() {
  try {
    const updatedEvent = await patchGoogleCalendarEvent({
      calendar_id: 'primary',
      event_id: 'abc123xyz',
      summary: 'Updated Team Sync',
      start_time: '2024-07-01T14:00:00-07:00',
      end_time: '2024-07-01T15:00:00-07:00',
      timezone: 'America/Los_Angeles'
    });

    console.log('Event updated:', updatedEvent.summary);
    console.log('New start time:', updatedEvent.start.dateTime);
  } catch (error) {
    console.error('Failed to update event:', error);
  }
}
```

### Example 2: Update Attendees and Send Notifications

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';

async function updateAttendees() {
  try {
    const updatedEvent = await patchGoogleCalendarEvent({
      calendar_id: 'primary',
      event_id: 'xyz789abc',
      attendees: [
        'alice@example.com',
        'bob@example.com',
        'charlie@example.com'
      ],
      send_updates: 'all' // Notify all attendees
    });

    console.log('Attendees updated:', updatedEvent.attendees?.length);
  } catch (error) {
    console.error('Failed to update attendees:', error);
  }
}
```

### Example 3: Update RSVP Response

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';

async function respondToInvite() {
  try {
    const updatedEvent = await patchGoogleCalendarEvent({
      calendar_id: 'primary',
      event_id: 'meeting123',
      rsvp_response: 'accepted'
    });

    console.log('RSVP updated successfully');
  } catch (error) {
    console.error('Failed to update RSVP:', error);
  }
}
```

### Example 4: Add Google Meet Conference

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';

async function addMeetLink() {
  try {
    const updatedEvent = await patchGoogleCalendarEvent({
      calendar_id: 'primary',
      event_id: 'event456',
      conference_data_version: 1,
      summary: 'Team Meeting (with Google Meet)'
    });

    console.log('Meet link:', updatedEvent.hangoutLink);
  } catch (error) {
    console.error('Failed to add conference:', error);
  }
}
```

## Error Handling

The function throws errors in the following scenarios:

1. **Missing Required Parameters**: If `calendar_id` or `event_id` is not provided
   ```typescript
   Error: Missing required parameter: calendar_id
   Error: Missing required parameter: event_id
   ```

2. **Invalid MCP Response**: If the response format is incorrect
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed
   ```typescript
   Error: Failed to parse MCP response JSON: [details]
   ```

4. **Tool Execution Failure**: If the Google Calendar API returns an error
   ```typescript
   Error: MCP tool execution failed
   Error: [specific error message from API]
   ```

5. **Missing Data**: If the response is successful but contains no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Error Handling Example

```typescript
import { request as patchGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_EVENT';

async function safeUpdateEvent() {
  try {
    const result = await patchGoogleCalendarEvent({
      calendar_id: 'primary',
      event_id: 'event123',
      summary: 'New Title'
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Missing required parameter')) {
        console.error('Validation error:', error.message);
      } else if (error.message.includes('MCP tool execution failed')) {
        console.error('API error:', error.message);
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
    throw error;
  }
}
```

## Important Notes

1. **Partial Updates**: Only the fields you provide will be updated. Other fields remain unchanged.
2. **Attendee Replacement**: The `attendees` parameter replaces ALL existing attendees. To remove all attendees, pass an empty array `[]`.
3. **Time Zones**: If you provide `start_time` or `end_time` without timezone info, specify the `timezone` parameter or UTC will be used.
4. **All-Day Events**: Use `YYYY-MM-DD` format for all-day events (e.g., `'2024-07-01'`).
5. **RSVP Updates**: The `rsvp_response` parameter only updates the authenticated user's response status.
6. **Conference Data**: Set `conference_data_version: 1` to manage Google Meet links and conference details.
7. **Notifications**: Use `send_updates` to control whether attendees receive update notifications.

## Related Operations

- To create a new event, use the `GOOGLECALENDAR_CREATE_EVENT` tool
- To delete an event, use the `GOOGLECALENDAR_DELETE_EVENT` tool
- To retrieve event details, use the `GOOGLECALENDAR_GET_EVENT` tool
- To list events, use the `GOOGLECALENDAR_LIST_EVENTS` tool