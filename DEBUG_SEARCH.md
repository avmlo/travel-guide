# Debug: Search Bar vs Chat Component

## What should be the same:
1. Both use `/api/ai-chat` endpoint
2. Both pass `query`, `userId`, `conversationHistory`
3. Both handle responses the same way

## Potential differences:
1. **Timing**: Search bar uses debounce (500ms), chat component is instant on Enter
2. **Conversation History**: Check if format matches exactly
3. **Error Handling**: Make sure both handle errors identically

## Test cases:
- "romantic restaurant in tokyo"
- "cozy cafe paris"
- Follow-up: "what about london"
