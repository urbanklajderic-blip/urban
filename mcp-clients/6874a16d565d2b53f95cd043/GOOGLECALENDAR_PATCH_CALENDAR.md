# Google Calendar - Patch Calendar

Updates (patches) metadata for a Google Calendar including summary, description, location, and timezone.

## Import

```typescript
import { request as patchGoogleCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_CALENDAR';
```

## Function Signature

```typescript
async function request(params: PatchCalendarParams): Promise<PatchCalendarData>
```

## Parameters

### `PatchCalendarParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `calendar_id` | `string` | Yes | Identifier of the Google Calendar to update. Use 'primary' for the main calendar or a specific calendar ID. |
| `summary` | `string` | Yes | New title for the calendar. Cannot be an empty string. |
| `description` | `string \| null` | No | New description for the calendar. |
| `location` | `string \| null` | No | New geographic location of the calendar (e.g., 'Paris, France'). |
| `timezone` | `string \| null` | No | New IANA Time Zone Database name (e.g., 'Europe/Zurich', 'America/New_York'). |

## Return Value

### `PatchCalendarData`

Returns an object containing:

- `response_data`: Calendar resource with updated metadata including:
  - `id`: Calendar identifier
  - `kind`: Resource type (always "calendar#calendar")
  - `etag`: ETag for versioning
  - `summary`: Calendar title
  - `description`: Calendar description (optional)
  - `location`: Geographic location (optional)
  - `timeZone`: IANA timezone ID (optional)
  - `conferenceProperties`: Conference settings (optional)

## Usage Examples

### Update Calendar Title and Timezone

```typescript
import { request as patchGoogleCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_CALENDAR';

async function updateCalendar() {
  try {
    const result = await patchGoogleCalendar({
      calendar_id: 'primary',
      summary: 'My Work Calendar',
      timezone: 'America/New_York'
    });
    
    console.log('Calendar updated:', result.response_data.summary);
    console.log('New timezone:', result.response_data.timeZone);
  } catch (error) {
    console.error('Failed to update calendar:', error);
  }
}
```

### Update Calendar with Full Details

```typescript
import { request as patchGoogleCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_CALENDAR';

async function updateCalendarDetails() {
  try {
    const result = await patchGoogleCalendar({
      calendar_id: 'example@group.calendar.google.com',
      summary: 'Team Meetings',
      description: 'Weekly team sync meetings and planning sessions',
      location: 'Paris, France',
      timezone: 'Europe/Paris'
    });
    
    console.log('Updated calendar:', result.response_data);
  } catch (error) {
    console.error('Failed to update calendar:', error);
  }
}
```

### Update Only Calendar Description

```typescript
import { request as patchGoogleCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_PATCH_CALENDAR';

async function updateDescription() {
  try {
    const result = await patchGoogleCalendar({
      calendar_id: 'primary',
      summary: 'My Calendar', // Required even if not changing
      description: 'Updated description for my calendar'
    });
    
    console.log('Description updated:', result.response_data.description);
  } catch (error) {
    console.error('Failed to update description:', error);
  }
}
```

## Error Handling

The function may throw errors in the following cases:

- **Missing Required Parameters**: If `calendar_id` or `summary` is not provided
- **Invalid MCP Response**: If the MCP service returns malformed data
- **Tool Execution Failure**: If the Google Calendar API returns an error
- **Authentication Issues**: If the calendar cannot be accessed with current credentials
- **Invalid Calendar ID**: If the specified calendar does not exist

Always wrap calls in try-catch blocks to handle potential errors gracefully.

```typescript
try {
  const result = await patchGoogleCalendar(params);
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Error updating calendar:', error.message);
  }
  // Handle error appropriately
}
```

## Notes

- Only the fields provided in the request will be updated; omitted optional fields remain unchanged
- The `summary` field is required even if you're only updating other fields
- Use 'primary' as the `calendar_id` to update the user's primary calendar
- Timezone values must be valid IANA Time Zone Database names
- The function returns the complete updated calendar resource, not just the changed fields