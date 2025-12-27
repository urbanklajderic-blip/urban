export type McpServerId = keyof typeof MCP_SERVERS;

// { "mcp-id": { id: string, name: string, url: string } }
export const MCP_SERVERS = {
  "6874a16d565d2b53f95cd043": {
    "id": "6874a16d565d2b53f95cd043",
    "name": "Google Calendar",
    "url": "https://backend.composio.dev/v3/mcp/a123b074-4724-4fa8-89c2-a7746b7f8828/mcp?user_id=694f132f5296c90e87490c66"
  },
  "686de4616fd1cae1afbb55b9": {
    "id": "686de4616fd1cae1afbb55b9",
    "name": "Notion",
    "url": "https://backend.composio.dev/v3/mcp/4c5f76f7-bbb8-4a8a-a478-ab5a2d7b0fa2/mcp?user_id=694f132f5296c90e87490c66"
  },
  "686de3ea6fd1cae1afbb55b6": {
    "id": "686de3ea6fd1cae1afbb55b6",
    "name": "Google Tasks",
    "url": "https://backend.composio.dev/v3/mcp/5644cff0-2da1-4524-b57e-01d47e972056/mcp?user_id=694f132f5296c90e87490c66"
  }
};