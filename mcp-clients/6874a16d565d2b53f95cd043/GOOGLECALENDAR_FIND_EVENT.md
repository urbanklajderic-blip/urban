# Google Calendar Find Event - Cheatsheet

## Overview

This module provides a TypeScript interface to find and query events in Google Calendar. It supports various filtering options including time ranges, event types, search queries, and pagination.

## Installation/Import

```typescript
import { request as findGoogleCalendarEvents } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';
import type { FindEventParams, FindEventData } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';
```

## Function Signature

```typescript
async function request(params: FindEventParams): Promise<FindEventData>
```

## Parameters

### `FindEventParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calendar_id` | `string` | No | `"primary"` | Calendar identifier (use 'primary', email, or calendar ID) |
| `event_types` | `EventType[]` | No | All types | Event types to include (birthday, default, focusTime, outOfOffice, workingLocation) |
| `max_results` | `number` | No | `10` | Maximum events per page (1-2500) |
| `order_by` | `'startTime' \| 'updated'` | No | `null` | Sort order (startTime requires single_events=true) |
| `page_token` | `string` | No | `null` | Token for pagination |
| `query` | `string` | No | `null` | Free-text search query |
| `show_deleted` | `boolean` | No | `null` | Include cancelled events |
| `single_events` | `boolean` | No | `true` | Expand recurring events into instances |
| `timeMax` | `string` | No | `null` | Upper bound for event start time (RFC3339) |
| `timeMin` | `string` | No | `null` | Lower bound for event end time (RFC3339) |
| `updated_min` | `string` | No | `null` | Lower bound for last modification time (RFC3339) |

## Return Value

### `FindEventData`

The function returns a `FindEventData` object containing:

- `event_data`: Main wrapper with event array and pagination tokens
  - `event_data`: Array of `GoogleCalendarEvent` objects
  - `nextPageToken`: Token for next page (if available)
  - `nextSyncToken`: Token for incremental sync (if available)
  - `note`: Optional API note
- `accessRole`: User's access role for the calendar
- `defaultReminders`: Default reminders configuration
- `summary`: Calendar title
- `timeZone`: Calendar timezone
- Additional metadata fields

### `GoogleCalendarEvent`

Each event contains comprehensive information including:
- `id`, `summary`, `description`: Basic event info
- `start`, `end`: Event timing (with date/dateTime/timeZone)
- `attendees`: List of event attendees
- `organizer`, `creator`: Event participants
- `location`: Event location
- `status`: Event status (confirmed, tentative, cancelled)
- `eventType`: Type of event
- `recurrence`: Recurrence rules (for recurring events)
- `reminders`: Reminder configuration
- And many more fields...

## Usage Examples

### Example 1: Find Upcoming Events

```typescript
import { request as findGoogleCalendarEvents } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';

async function getUpcomingEvents() {
  try {
    const result = await findGoogleCalendarEvents({
      calendar_id: 'primary',
      timeMin: '2024-01-01T00:00:00Z',
      timeMax: '2024-12-31T23:59:59Z',
      max_results: 10,
      single_events: true,
      order_by: 'startTime'
    });

    console.log(`Found ${result.event_data.event_data.length} events`);
    
    result.event_data.event_data.forEach(event => {
      console.log(`- ${event.summary} at ${event.start?.dateTime || event.start?.date}`);
    });

    // Handle pagination if needed
    if (result.event_data.nextPageToken) {
      console.log('More events available, use nextPageToken for next page');
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
}
```

### Example 2: Search Events by Query

```typescript
import { request as findGoogleCalendarEvents } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';

async function searchEvents(searchTerm: string) {
  try {
    const result = await findGoogleCalendarEvents({
      calendar_id: 'primary',
      query: searchTerm,
      max_results: 20,
      single_events: true
    });

    console.log(`Found ${result.event_data.event_data.length} events matching "${searchTerm}"`);
    
    return result.event_data.event_data.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      location: event.location,
      attendees: event.attendees?.length || 0
    }));
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}
```

### Example 3: Paginated Event Retrieval

```typescript
import { request as findGoogleCalendarEvents } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';

async function getAllEvents() {
  const allEvents = [];
  let pageToken: string | null | undefined = null;

  do {
    const result = await findGoogleCalendarEvents({
      calendar_id: 'primary',
      timeMin: '2024-01-01T00:00:00Z',
      max_results: 100,
      single_events: true,
      order_by: 'startTime',
      page_token: pageToken || undefined
    });

    allEvents.push(...result.event_data.event_data);
    pageToken = result.event_data.nextPageToken;

    console.log(`Retrieved ${allEvents.length} events so far...`);
  } while (pageToken);

  console.log(`Total events retrieved: ${allEvents.length}`);
  return allEvents;
}
```

### Example 4: Filter by Event Types

```typescript
import { request as findGoogleCalendarEvents } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';

async function getWorkingLocationEvents() {
  try {
    const result = await findGoogleCalendarEvents({
      calendar_id: 'primary',
      event_types: ['workingLocation', 'outOfOffice'],
      timeMin: new Date().toISOString(),
      max_results: 50,
      single_events: true,
      order_by: 'startTime'
    });

    return result.event_data.event_data.filter(event => 
      event.eventType === 'workingLocation' || event.eventType === 'outOfOffice'
    );
  } catch (error) {
    console.error('Failed to fetch working location events:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

1. **Invalid MCP Response**: If the MCP tool returns an invalid response format
   ```typescript
   Error: 'Invalid MCP response format: missing content[0].text'
   ```

2. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```typescript
   Error: 'Failed to parse MCP response JSON: [error details]'
   ```

3. **Tool Execution Failure**: If the MCP tool reports unsuccessful execution
   ```typescript
   Error: 'MCP tool execution failed' or specific error message from tool
   ```

4. **Missing Data**: If the tool returns success but no data
   ```typescript
   Error: 'MCP tool returned successful response but no data'
   ```

### Recommended Error Handling Pattern

```typescript
try {
  const result = await findGoogleCalendarEvents(params);
  // Process result
} catch (error) {
  if (error instanceof Error) {
    console.error('Error finding events:', error.message);
    // Handle specific error cases
    if (error.message.includes('Invalid MCP response')) {
      // Handle MCP communication error
    } else if (error.message.includes('parse')) {
      // Handle JSON parsing error
    }
  }
  throw error; // Re-throw or handle appropriately
}
```

## Notes

- **Time Formats**: Time parameters accept RFC3339 timestamps (e.g., '2024-12-06T13:00:00Z'), comma-separated parts, or simple datetime strings
- **Recurring Events**: Set `single_events: true` to expand recurring events into individual instances
- **Ordering**: Using `order_by: 'startTime'` requires `single_events: true`
- **Performance**: For large calendars, specify both `timeMin` and `timeMax` to improve performance
- **Pagination**: Use `nextPageToken` from the response to fetch subsequent pages
- **Sync Token**: Use `nextSyncToken` for incremental synchronization on subsequent calls
- **Deleted Events**: Set `show_deleted: true` to include cancelled events in results

## TypeScript Types

All TypeScript interfaces are exported and can be imported for type safety:

```typescript
import type {
  FindEventParams,
  FindEventData,
  GoogleCalendarEvent,
  EventDateTime,
  Attendee,
  Participant,
  ReminderOverride,
  EventType,
  OrderBy
} from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_EVENT';
```