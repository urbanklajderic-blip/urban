# Google Calendar Delete Event

Delete an event from a Google Calendar using its unique event identifier.

## Import

```typescript
import { request as deleteGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_DELETE_EVENT';
```

## Function Signature

```typescript
async function request(params: DeleteEventParams): Promise<DeleteEventData>
```

## Parameters

### `DeleteEventParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `event_id` | `string` | ✅ Yes | - | Unique identifier of the event to delete |
| `calendar_id` | `string` | No | `"primary"` | Calendar identifier (email, specific ID, or 'primary') |

### Examples

**Delete from primary calendar:**
```typescript
{
  event_id: 'abc123eventid'
}
```

**Delete from specific calendar:**
```typescript
{
  event_id: 'xyz789eventid',
  calendar_id: 'user@example.com'
}
```

**Delete from group calendar:**
```typescript
{
  event_id: 'def456eventid',
  calendar_id: 'team-calendar@group.calendar.google.com'
}
```

## Return Value

### `DeleteEventData`

```typescript
{
  response_data?: {
    status: 'success'
  } | null
}
```

The response contains an optional `response_data` object with a `status` field indicating successful deletion.

## Usage Examples

### Basic Usage (Primary Calendar)

```typescript
import { request as deleteGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_DELETE_EVENT';

async function deleteMyEvent() {
  try {
    const result = await deleteGoogleCalendarEvent({
      event_id: 'abc123eventid'
    });
    
    console.log('Event deleted successfully:', result);
  } catch (error) {
    console.error('Failed to delete event:', error);
  }
}
```

### Delete from Specific Calendar

```typescript
import { request as deleteGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_DELETE_EVENT';

async function deleteTeamEvent(eventId: string) {
  try {
    const result = await deleteGoogleCalendarEvent({
      event_id: eventId,
      calendar_id: 'team@example.com'
    });
    
    if (result.response_data?.status === 'success') {
      console.log('Team event deleted successfully');
    }
  } catch (error) {
    console.error('Failed to delete team event:', error);
  }
}
```

### With Error Handling

```typescript
import { request as deleteGoogleCalendarEvent } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_DELETE_EVENT';

async function safeDeleteEvent(eventId: string, calendarId?: string) {
  try {
    const result = await deleteGoogleCalendarEvent({
      event_id: eventId,
      calendar_id: calendarId || 'primary'
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred'
    };
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

- **Missing Required Parameter**: If `event_id` is not provided
- **Invalid MCP Response**: If the response format is malformed
- **JSON Parse Error**: If the response cannot be parsed
- **Tool Execution Failure**: If the Google Calendar API returns an error
- **No Data Returned**: If the tool succeeds but returns no data

### Common Error Scenarios

```typescript
// Missing event_id
await deleteGoogleCalendarEvent({ calendar_id: 'primary' });
// Throws: "Missing required parameter: event_id"

// Event not found
await deleteGoogleCalendarEvent({ event_id: 'nonexistent' });
// Throws: "MCP tool execution failed" (with specific error from Google Calendar API)

// Invalid calendar
await deleteGoogleCalendarEvent({ 
  event_id: 'abc123',
  calendar_id: 'invalid@calendar.com'
});
// Throws: Error from Google Calendar API about calendar access
```

## Notes

- The `calendar_id` defaults to `'primary'` (authenticated user's main calendar)
- Event IDs are typically obtained when creating events or listing calendar events
- Successful deletion returns a response with `status: 'success'`
- The function requires proper Google Calendar API authentication via the MCP server
- Deleting an event is permanent and cannot be undone through this API