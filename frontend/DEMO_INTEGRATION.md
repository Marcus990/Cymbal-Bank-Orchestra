# Demo: User Name + Permission Integration

This guide demonstrates how the user name and permission integration works in the Cymbal Bank application.

## Setup Instructions

1. **Start the application** - Navigate to the onboarding page
2. **Enter your name** - Use a name like "Marcus" or "Sarah"
3. **Select permissions** - Choose which financial data the agent can access
4. **Continue to home** - Navigate to the main application
5. **Test the integration** - Send messages to see the context in action

## What Happens Behind the Scenes

### 1. Onboarding Flow
- User enters their name (e.g., "Marcus")
- User selects/deselects permissions
- Both are stored in `PermissionsContext` and localStorage
- User is redirected to home page

### 2. Context Generation
When a user sends a message, the system automatically generates:

```
The user's ID is Marcus. You must never ask for the user for their name or ID. Always assume their user ID is Marcus.

Permission Context: You do not have access to the user's transaction history. You do not have access to the user's debt information. Please respect these limitations when responding to user queries.

User message: [actual user message]
```

### 3. Message Flow
1. User types: "Show me my spending patterns"
2. System prepends full context (invisible to user)
3. Agent receives complete context
4. Agent responds appropriately with user's name and permission awareness

## Expected Agent Responses

### With Transaction History Permission Disabled:
**User:** "Show me my spending patterns"

**Agent:** "Hello Marcus! I'd be happy to help you analyze your spending patterns! However, I don't currently have access to your transaction history. To provide this analysis, you would need to enable the 'Analyze Spending Habits' permission in your settings."

### With Full Permissions:
**User:** "Show me my spending patterns"

**Agent:** "Hello Marcus! I'd be happy to help you analyze your spending patterns. I have full access to your financial data and can provide detailed insights about your spending habits."

## Testing Scenarios

### Scenario 1: Limited Permissions
1. Disable most permissions during onboarding
2. Ask the agent about financial data
3. Verify it explains what permissions are needed

### Scenario 2: Full Permissions
1. Enable all permissions during onboarding
2. Ask the agent about financial data
3. Verify it acknowledges full access

### Scenario 3: User Identification
1. Use any name during onboarding
2. Ask the agent questions
3. Verify it always addresses you by name
4. Verify it never asks for your name or ID

## Console Debugging

Open browser console to see:
- Generated permission context
- Full messages being sent to agents
- Permission state changes

## Key Benefits Demonstrated

1. **Personalization**: Agent always knows your name
2. **Transparency**: Permission context is invisible to users
3. **Security**: Agent respects permission boundaries
4. **User Experience**: Seamless integration without UI changes
5. **Persistence**: Settings survive browser sessions

## Troubleshooting

- **Name not showing**: Check localStorage for 'userName' entry
- **Permissions not working**: Check localStorage for 'userPermissions' entry
- **Context not generating**: Verify PermissionsContext is properly wrapped
- **Messages not sending**: Check WebSocket connection status
