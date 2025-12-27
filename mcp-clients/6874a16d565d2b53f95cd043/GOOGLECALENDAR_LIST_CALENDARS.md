# Google Calendar - List Calendars

Lists all calendars accessible by the authenticated user from their Google Calendar account with support for filtering, pagination, and incremental synchronization.

## Import

```typescript
import { request as listGoogleCalendars } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_LIST_CALENDARS';
```

## Function Signature

```typescript
async function request(params: ListCalendarsParams): Promise<ListCalendarsData>
```

## Parameters

### `ListCalendarsParams`

All parameters are optional:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxResults` | `number` | `100` | Maximum number of calendars to return per page (max: 250) |
| `minAccessRole` | `'freeBusyReader' \| 'owner' \| 'reader' \| 'writer' \| null` | `null` | Minimum access role filter |
| `pageToken` | `string \| null` | `null` | Token for retrieving a specific page from previous request |
| `showDeleted` | `boolean` | `false` | Include deleted calendar entries |
| `showHidden` | `boolean` | `false` | Include hidden calendars |
| `syncToken` | `string \| null` | `null` | Token for incremental sync (retrieves only changed entries) |

**Note**: When using `syncToken`, only `syncToken` and optionally `pageToken` are used; other filters are ignored. `minAccessRole` cannot be combined with `syncToken`.

## Return Value

### `ListCalendarsData`

```typescript
{
  kind: string;                          // "calendar#calendarList"
  etag?: string | null;                  // ETag of the collection
  nextPageToken?: string | null;         // Token for next page
  nextSyncToken?: string | null;         // Token for incremental sync
  items?: CalendarListEntry[] | null;    // Array of calendar entries
  calendars?: CalendarListEntry[] | null; // Alternative field name (same as items)
}
```

### `CalendarListEntry`

Each calendar entry contains:

- `id`: Calendar identifier
- `summary`: Calendar title
- `accessRole`: User's access level (`'freeBusyReader' | 'reader' | 'writer' | 'owner'`)
- `kind`: Resource type
- `backgroundColor`, `foregroundColor`, `colorId`: Color settings
- `description`: Calendar description
- `timeZone`: Calendar timezone
- `location`: Geographic location
- `primary`: Whether this is the user's primary calendar
- `selected`: Whether calendar is shown in UI
- `hidden`: Whether calendar is hidden
- `deleted`: Whether calendar is deleted
- `defaultReminders`: Default reminder settings
- `notificationSettings`: Notification configuration
- `conferenceProperties`: Conference solution settings

## Usage Examples

### Basic Usage - List All Calendars

```typescript
import { request as listGoogleCalendars } from '@/sdk/mcp-clients/6874a16d565d2b53f95cd043/GOOGLECALENDAR_LIST_CALENDARS';

async function getAllCalendars() {
  try {
    const result = await listGoogleCalendars({});
    
    console.log(`Found ${result.items?.length || 0} calendars`);
    
    result.items?.forEach(calendar => {
      console.log(`- ${calendar.summary} (${calendar.accessRole})`);
    });
    
    return result;
  } catch (error) {
    console.error('Failed to list calendars:', error);
    throw error;
  }
}
```

### Filter by Access Role

```typescript
async function getOwnedCalendars() {
  const result = await listGoogleCalendars({
    minAccessRole: 'owner',
    maxResults: 50
  });
  
  return result.items?.filter(cal => cal.accessRole === 'owner') || [];
}
```

### Pagination Example

```typescript
async function getAllCalendarsPaginated() {
  const allCalendars: CalendarListEntry[] = [];
  let pageToken: string | null | undefined = undefined;
  
  do {
    const result = await listGoogleCalendars({
      maxResults: 100,
      pageToken: pageToken || undefined
    });
    
    if (result.items) {
      allCalendars.push(...result.items);
    }
    
    pageToken = result.nextPageToken;
  } while (pageToken);
  
  return allCalendars;
}
```

### Incremental Sync Example

```typescript
let syncToken: string | null = null;

async function syncCalendars() {
  const params = syncToken 
    ? { syncToken } 
    : { showDeleted: true, showHidden: true };
  
  const result = await listGoogleCalendars(params);
  
  // Process changes
  result.items?.forEach(calendar => {
    if (calendar.deleted) {
      console.log(`Calendar deleted: ${calendar.summary}`);
    } else {
      console.log(`Calendar updated: ${calendar.summary}`);
    }
  });
  
  // Save sync token for next sync
  if (result.nextSyncToken) {
    syncToken = result.nextSyncToken;
  }
  
  return result;
}
```

### Get Primary Calendar

```typescript
async function getPrimaryCalendar() {
  const result = await listGoogleCalendars({});
  
  const primaryCalendar = result.items?.find(cal => cal.primary === true);
  
  if (!primaryCalendar) {
    throw new Error('Primary calendar not found');
  }
  
  return primaryCalendar;
}
```

### Filter Visible Calendars Only

```typescript
async function getVisibleCalendars() {
  const result = await listGoogleCalendars({
    showHidden: false,
    showDeleted: false
  });
  
  return result.items?.filter(cal => 
    cal.selected === true && 
    !cal.hidden && 
    !cal.deleted
  ) || [];
}
```

## Error Handling

The function may throw errors in the following cases:

- **Invalid MCP Response**: When the MCP service returns malformed data
- **JSON Parse Error**: When the response cannot be parsed as JSON
- **Tool Execution Failure**: When the Google Calendar API returns an error
- **Authentication Error**: When the user is not authenticated or lacks permissions
- **Network Error**: When the request fails due to connectivity issues

```typescript
try {
  const calendars = await listGoogleCalendars({ maxResults: 50 });
  // Process calendars
} catch (error) {
  if (error instanceof Error) {
    console.error('Error listing calendars:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('authentication')) {
      // Handle auth error
    } else if (error.message.includes('parse')) {
      // Handle parse error
    }
  }
}
```

## Notes

- The function returns both `items` and `calendars` fields containing the same data for compatibility
- When using `syncToken`, the response includes only calendars that changed since the last sync
- Maximum `maxResults` value is 250
- Use `nextPageToken` for pagination and `nextSyncToken` for incremental synchronization
- Primary calendar is typically the user's main Google Calendar
- Access roles determine what operations can be performed on each calendar