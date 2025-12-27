# Google Calendar - Get Calendar

Retrieve metadata for a Google Calendar by its identifier.

## Import

```typescript
import { request as getCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_GET_CALENDAR';
```

## Function Signature

```typescript
async function request(params: GetCalendarParams): Promise<GetCalendarData>
```

## Parameters

### `GetCalendarParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calendar_id` | `string` | No | `"primary"` | Identifier of the Google Calendar to retrieve. Use 'primary' for the user's main calendar, or provide a calendar email address. |

**Examples of valid calendar IDs:**
- `"primary"` - User's main calendar
- `"user@example.com"` - Specific calendar by email
- `"en.usa#holiday@group.v.calendar.google.com"` - Public holiday calendar

## Return Value

### `GetCalendarData`

Returns an object containing:

```typescript
{
  calendar_data: {
    kind: string;              // Always "calendar#calendar"
    etag: string;              // ETag for caching
    id: string;                // Calendar identifier
    summary: string;           // Calendar title/name
    description?: string;      // Calendar description (optional)
    location?: string;         // Geographic location (optional)
    timeZone?: string;         // IANA timezone (e.g., "America/New_York")
    conferenceProperties?: {   // Conference settings (optional)
      allowedConferenceSolutionTypes: Array<'eventHangout' | 'eventNamedHangout' | 'hangoutsMeet'>;
    };
  }
}
```

## Usage Examples

### Example 1: Get Primary Calendar

```typescript
import { request as getCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_GET_CALENDAR';

async function fetchPrimaryCalendar() {
  try {
    const result = await getCalendar({ calendar_id: 'primary' });
    
    console.log('Calendar Name:', result.calendar_data.summary);
    console.log('Calendar ID:', result.calendar_data.id);
    console.log('Time Zone:', result.calendar_data.timeZone);
    console.log('Description:', result.calendar_data.description);
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
  }
}
```

### Example 2: Get Specific Calendar by Email

```typescript
import { request as getCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_GET_CALENDAR';

async function fetchSpecificCalendar() {
  try {
    const result = await getCalendar({ 
      calendar_id: 'team@company.com' 
    });
    
    console.log('Team Calendar:', result.calendar_data.summary);
    console.log('Location:', result.calendar_data.location);
    
    // Check conference properties
    if (result.calendar_data.conferenceProperties) {
      console.log('Supported conference types:', 
        result.calendar_data.conferenceProperties.allowedConferenceSolutionTypes
      );
    }
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
  }
}
```

### Example 3: Using Default Parameters

```typescript
import { request as getCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_GET_CALENDAR';

async function fetchDefaultCalendar() {
  try {
    // Omitting calendar_id defaults to 'primary'
    const result = await getCalendar({});
    
    console.log('Default Calendar:', result.calendar_data.summary);
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Invalid MCP Response**: When the MCP service returns a malformed response
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

2. **JSON Parse Error**: When the response cannot be parsed as JSON
   ```typescript
   Error: Failed to parse MCP response JSON: [parse error details]
   ```

3. **Tool Execution Failure**: When the Google Calendar API returns an error
   ```typescript
   Error: [specific error from Google Calendar API]
   ```

4. **Missing Data**: When the tool succeeds but returns no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Recommended Error Handling Pattern

```typescript
import { request as getCalendar } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_GET_CALENDAR';

async function safeGetCalendar(calendarId: string = 'primary') {
  try {
    const result = await getCalendar({ calendar_id: calendarId });
    return { success: true, data: result };
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Notes

- The `calendar_id` parameter is optional and defaults to `"primary"`
- All calendar data fields except `kind`, `etag`, `id`, and `summary` are optional
- The function automatically handles MCP response parsing and error checking
- Time zones are returned in IANA format (e.g., "America/New_York", "Europe/London")
- Conference properties indicate which Google Meet/Hangouts features are available