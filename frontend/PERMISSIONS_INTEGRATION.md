# Permission Integration for AI Agent

This document explains how the permission system integrates with the AI agent to provide context-aware responses.

## Overview

The permission system automatically prepends permission context and user identification to every message sent to the AI agent. This ensures that the agent is always aware of what data it can and cannot access, as well as who the user is, without requiring manual intervention.

## How It Works

### 1. User Information Collection
- Users provide their name during onboarding in `OnboardingPage.tsx`
- The name is stored alongside permissions in `PermissionsContext`
- Both are persisted to localStorage for session continuity

### 2. Permission Collection
- Users select permissions during onboarding in `OnboardingPage.tsx`
- Permissions are stored in `PermissionsContext` and persisted to localStorage
- Each permission represents access to specific financial data or actions

### 3. Context Generation
- `PermissionsContext.getPermissionContext()` generates a comprehensive context string
- Includes user ID information: "The user's ID is {user_name}. You must never ask for the user for their name or ID. Always assume their user ID is {user_name}"
- Followed by permission descriptions for disabled permissions
- For enabled permissions, it indicates full access

### 4. Message Preprocessing
- `RealtimeAgentClient.sendText()` automatically prepends the full context to all messages
- Format: `[User ID Context]\n\n[Permission Context]\n\nUser message: [actual message]`
- This happens transparently - the user only sees their original message in the UI

### 5. Agent Response
- The AI agent receives the full context and can respond appropriately
- It knows who the user is and what data it can access
- Responses respect permission limitations without exposing them to the user

## Example

**User types:** "Show me my spending patterns"

**What gets sent to agent:**
```
The user's ID is Marcus. You must never ask for the user for their name or ID. Always assume their user ID is Marcus.

Permission Context: You do not have access to the user's transaction history. Please respect these limitations when responding to user queries.

User message: Show me my spending patterns
```

**Agent response:** "Hello Marcus! I'd be happy to help you analyze your spending patterns! However, I don't currently have access to your transaction history. To provide this analysis, you would need to enable the 'Analyze Spending Habits' permission in your settings."

## Benefits

1. **Personalized**: Agent always knows the user's name and can address them directly
2. **Transparent**: Permission context is never shown to users in transcripts
3. **Automatic**: No manual intervention required
4. **Secure**: Agent always knows its limitations
5. **User-friendly**: Clear explanations when permissions are needed
6. **Persistent**: Permissions and user name survive page refreshes
7. **Scalable**: Easy to add new permissions

## Technical Implementation

- **Context Provider**: `PermissionsContext.tsx` manages global permission and user name state
- **WebSocket Integration**: `wsAgent.ts` automatically injects full context
- **Persistence**: localStorage ensures permissions and user name survive browser sessions
- **Routing**: App automatically routes users based on onboarding completion
- **UI Updates**: HomePage displays personalized welcome messages

## Adding New Permissions

1. Add permission ID to `types.ts`
2. Add permission object to `constants.tsx`
3. Update `PermissionsContext.tsx` to handle the new permission
4. The system automatically integrates new permissions

## Security Notes

- Permission context and user ID are only sent to the AI agent, not displayed to users
- The agent cannot override permissions - they are enforced at the message level
- All permission checks happen client-side before messages are sent
- User identification is handled securely through the context system
