# Google Calendar - Find Free Slots

Query free/busy information for Google Calendar calendars and find available time slots.

## Import

```typescript
import { request as findFreeSlots } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_FREE_SLOTS';
```

## Function Signature

```typescript
async function findFreeSlots(params: FindFreeSlotsParams): Promise<FindFreeSlotsData>
```

## Parameters

### `FindFreeSlotsParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calendar_expansion_max` | `number` | No | `50` | Maximum calendars for which FreeBusy information is provided (max: 50) |
| `group_expansion_max` | `number` | No | `100` | Maximum calendar identifiers to return for a single group (max: 100) |
| `items` | `string[]` | No | `["primary"]` | List of calendar identifiers to query. Can be 'primary', email addresses, or calendar IDs |
| `time_min` | `string \| null` | No | `null` | Start datetime for the query interval (ISO 8601, comma-separated, or simple format) |
| `time_max` | `string \| null` | No | `null` | End datetime for the query interval (ISO 8601, comma-separated, or simple format) |
| `timezone` | `string` | No | `"UTC"` | IANA timezone identifier (e.g., 'America/New_York', 'Europe/London') |

### Calendar Identifier Examples
- `"primary"` - User's primary calendar
- `"user@example.com"` - User's email address
- `"unique_calendar_id@group.calendar.google.com"` - Specific calendar ID

### Datetime Format Examples
- ISO 8601: `"2024-12-06T13:00:00Z"`
- Comma-separated: `"2024,12,06,13,00,00"`
- Simple format: `"2024-12-06 13:00:00"`

## Return Value

### `FindFreeSlotsData`

```typescript
{
  kind: string;              // Always 'calendar#freeBusy'
  timeMin: string;           // Query window start (ISO 8601)
  timeMax: string;           // Query window end (ISO 8601)
  calendars?: {              // Map of calendar IDs to their free/busy info
    [calendarId: string]: {
      busy?: Array<{
        start: string;       // Busy period start (ISO 8601)
        end: string;         // Busy period end (ISO 8601)
      }>;
      free?: Array<{
        start: string;       // Free period start (ISO 8601)
        end: string;         // Free period end (ISO 8601)
      }>;
    }
  } | null;
}
```

## Usage Examples

### Basic Usage - Check Primary Calendar

```typescript
import { request as findFreeSlots } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_FREE_SLOTS';

async function checkAvailability() {
  const result = await findFreeSlots({
    items: ['primary'],
    time_min: '2024-12-06T09:00:00',
    time_max: '2024-12-06T17:00:00',
    timezone: 'America/New_York'
  });

  console.log('Query window:', result.timeMin, 'to', result.timeMax);
  
  if (result.calendars?.primary) {
    const { busy, free } = result.calendars.primary;
    console.log('Busy periods:', busy);
    console.log('Free slots:', free);
  }
}
```

### Advanced Usage - Multiple Calendars

```typescript
import { request as findFreeSlots } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_FREE_SLOTS';

async function findCommonFreeTime() {
  const result = await findFreeSlots({
    items: [
      'primary',
      'colleague@example.com',
      'meeting-room@group.calendar.google.com'
    ],
    time_min: '2024-12-06T13:00:00Z',
    time_max: '2024-12-06T18:00:00Z',
    timezone: 'UTC',
    calendar_expansion_max: 10
  });

  // Process each calendar's availability
  if (result.calendars) {
    for (const [calendarId, calendarData] of Object.entries(result.calendars)) {
      console.log(`\nCalendar: ${calendarId}`);
      console.log('Free slots:', calendarData.free);
      console.log('Busy periods:', calendarData.busy);
    }
  }
}
```

### Finding Next Available Slot

```typescript
import { request as findFreeSlots } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_FIND_FREE_SLOTS';

async function getNextAvailableSlot(durationMinutes: number = 60) {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(17, 0, 0, 0); // 5 PM

  const result = await findFreeSlots({
    items: ['primary'],
    time_min: now.toISOString(),
    time_max: endOfDay.toISOString(),
    timezone: 'America/Los_Angeles'
  });

  const freeSlots = result.calendars?.primary?.free || [];
  
  for (const slot of freeSlots) {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const slotDuration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (slotDuration >= durationMinutes) {
      console.log(`Next available ${durationMinutes}-minute slot:`, slot.start);
      return slot;
    }
  }
  
  console.log('No available slots found');
  return null;
}
```

## Error Handling

The function may throw errors in the following cases:

- **Invalid calendar identifiers**: If any calendar ID in `items` is invalid or not found
- **Invalid datetime format**: If `time_min` or `time_max` cannot be parsed
- **Invalid timezone**: If the `timezone` parameter is not a valid IANA timezone identifier
- **Exceeded limits**: If `calendar_expansion_max` > 50 or `group_expansion_max` > 100
- **MCP tool failure**: If the underlying MCP tool execution fails
- **Invalid response**: If the response format is malformed or missing required data

```typescript
try {
  const result = await findFreeSlots({
    items: ['primary', 'invalid-calendar@example.com'],
    time_min: '2024-12-06T09:00:00Z',
    time_max: '2024-12-06T17:00:00Z'
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to find free slots:', error.message);
    // Handle specific error cases
    if (error.message.includes('invalid')) {
      console.error('One or more calendar identifiers are invalid');
    }
  }
}
```

## Notes

- All timestamps in the response are in ISO 8601 format
- The `free` periods are computed as the complement of `busy` periods within the query window
- If `time_min` or `time_max` are provided without timezone information, they are interpreted using the `timezone` parameter
- The `calendars` field may be `null` or absent in some responses
- Maximum of 50 calendars can be queried in a single request
- All calendar identifiers are validated; invalid identifiers will cause the request to fail