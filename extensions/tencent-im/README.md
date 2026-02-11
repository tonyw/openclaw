# Tencent IM Plugin for OpenClaw

This plugin enables OpenClaw to connect to Tencent Cloud IM (Instant Messaging) service via REST API.

## Features

- **Direct Messages (C2C)**: One-on-one conversations with users
- **Group Messages**: Support for group chats
- **Media Support**: Send images and files
- **Impersonation**: Send messages as any user (using admin credentials)
- **REST API**: Server-side integration without WebSocket clients

## How It Works

Tencent IM's REST API allows you to:

1. Use an **admin account** to authenticate API calls
2. Send messages **as any user** (specifying `From_Account` in the request)

This means:

- `adminUserId` must have admin privileges in your Tencent IM app
- `userId` is the default sender (can be any user, not necessarily the admin)
- You can dynamically specify different senders when sending messages

## Prerequisites

1. Tencent Cloud account with IM service enabled
2. SDKAppID from Tencent Cloud Console
3. **Admin account** (e.g., `@TIM#ADMIN_xxxx` or your app admin)
4. UserSig generated for the admin account

## Configuration

### Minimal Configuration

```json5
{
  channels: {
    "tencent-im": {
      enabled: true,
      sdkAppId: "1400123456",
      // Admin account for API authentication (must have admin privileges)
      adminUserId: "@TIM#ADMIN_1400123456",
      // Default sender (can be any user, defaults to adminUserId if not set)
      userId: "openclaw_bot",
      userSig: "generated-user-sig-for-admin",
    },
  },
}
```

### Full Configuration

```json5
{
  channels: {
    "tencent-im": {
      enabled: true,
      sdkAppId: "1400123456",
      secretKey: "your-secret-key", // Optional, for generating UserSig
      adminUserId: "@TIM#ADMIN_1400123456", // Admin for REST API
      userId: "openclaw_bot", // Default message sender
      userSig: "your-generated-usersig",
      dmPolicy: "pairing", // "open", "pairing", or "allowlist"
      allowFrom: [],
      groupPolicy: "allowlist", // "open", "allowlist", or "disabled"
      groupAllowFrom: [],
      requireMention: false,
      textChunkLimit: 2000,
      mediaMaxMb: 20,
    },
  },
}
```

## Getting Admin Credentials

### 1. Get SDKAppID

1. Login to [Tencent Cloud IM Console](https://console.cloud.tencent.com/im)
2. Create an application or select existing one
3. Copy the `SDKAppID`

### 2. Get Admin Account

Tencent IM apps have a default admin account:

- Format: `@TIM#ADMIN_{SDKAppID}`
- Example: `@TIM#ADMIN_1400123456`

Or create a custom admin:

1. Go to your app → Configuration → Login and Message
2. Add an administrator account

### 3. Generate UserSig

Use the [UserSig Tool](https://console.cloud.tencent.com/im/tool-usersig) in the console:

1. Enter your admin UserID
2. Generate UserSig (set appropriate expiration)
3. Copy the UserSig to your config

Or use the server-side generation (requires `secretKey`):

```javascript
const { generateUserSig } = require("./src/client-rest.js");

const userSig = generateUserSig(
  sdkAppId,
  secretKey,
  adminUserId,
  86400 * 180, // 180 days
);
```

## Usage

### Sending Messages

```bash
# Send as default user (configured userId)
openclaw message send --channel tencent-im --to "user:123456" --message "Hello!"

# Send to group
openclaw message send --channel tencent-im --to "group:789012" --message "Hello group!"
```

### Target Formats

- `user:<userId>` or just `<userId>` - Direct message to user
- `group:<groupId>` - Message to group
- `C2C<userId>` - Tencent IM C2C conversation format
- `GROUP<groupId>` - Tencent IM group format

### Impersonation (Send as Any User)

When calling `sendMessageTencentIM` programmatically:

```typescript
import { sendMessageTencentIM } from "./src/send-rest.js";

// Send as user005
await sendMessageTencentIM({
  cfg,
  to: "user:target_user",
  text: "Hello!",
  fromUserId: "user005", // Override the default sender
});

// Send as another_bot
await sendMessageTencentIM({
  cfg,
  to: "group:my_group",
  text: "Announcement!",
  fromUserId: "another_bot",
});
```

**Note**: The `fromUserId` can be any user ID in your app, but the API call itself is authenticated using the `adminUserId` credentials.

## Security

### DM Policies

- `open`: Accept messages from anyone
- `pairing` (default): Require users to be in allowlist
- `allowlist`: Only accept from allowlisted users

### Group Policies

- `open`: Accept from any group member
- `allowlist` (default): Only from specific groups
- `disabled`: Disable group messages

## Multi-Account Support

```json5
{
  channels: {
    "tencent-im": {
      enabled: true,
      sdkAppId: "1400xxxxxx",
      adminUserId: "@TIM#ADMIN_1400xxxxxx",
      userId: "bot-primary",
      userSig: "...",
      accounts: {
        secondary: {
          enabled: true,
          sdkAppId: "1400yyyyyy",
          adminUserId: "@TIM#ADMIN_1400yyyyyy",
          userId: "bot-secondary",
          userSig: "...",
        },
      },
    },
  },
}
```

## Troubleshooting

### Error 60010: "set the identifier field to admin account"

Your `adminUserId` doesn't have admin privileges. Solutions:

1. Use the default admin: `@TIM#ADMIN_{SDKAppID}`
2. Grant admin privileges to your user in Tencent Console

### Error 70050: "User not found"

The sender (`From_Account`) or receiver (`To_Account`) doesn't exist.

- Import users first using the REST API
- Or ensure the users have logged in at least once

### Messages Not Received

1. Check UserSig is valid and not expired
2. Verify target user exists in the app
3. For group messages, ensure bot is in the group

## API Limitations

- **No message editing**: Tencent IM doesn't support editing sent messages
- **No reactions**: Emoji reactions not supported via REST API
- **No thread replies**: Threaded conversations not supported
- **Rate limits**: REST API has rate limits (see Tencent documentation)

## Development

### File Structure

```
extensions/tencent-im/
├── index.ts              # Plugin entry
├── src/
│   ├── channel.ts        # Main channel implementation
│   ├── client-rest.ts    # REST API client (admin auth, any sender)
│   ├── send-rest.ts      # Message sending with impersonation
│   ├── probe-rest.ts     # Health checks
│   ├── accounts.ts       # Account management
│   └── ...
```

## License

MIT
