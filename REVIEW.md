# Code Review Notes

## `server/routers/ai.ts`

### `chat` procedure allows empty message list
The request schema does not enforce at least one message. When the mutation executes it dereferences `messages[messages.length - 1]` to send the last message to Gemini. If the array is empty, `lastMessage` becomes `undefined` and `lastMessage.content` throws. This will surface as a 500 error for clients sending an empty history. Consider adding `.min(1)` to the `messages` schema or guarding before dereferencing.

### Missing `destinationSlug` in the typed itinerary result
The JSON schema passed to `generateStructuredWithGemini` allows each itinerary activity to include a `destinationSlug`, but the TypeScript type supplied to the generic omits that property. Consumers relying on the slug for linking will not have type coverage and will need to cast, increasing the risk of runtime mistakes. Extend the activity type to include an optional `destinationSlug: string` to match the schema and prompt.

### Tight coupling to raw destination objects
Multiple prompts send the entire `destinations` array as `z.array(z.any())` and then assume the presence of properties like `city`, `slug`, and `category`. If future API responses omit or rename these fields, the router will throw before it can even craft an LLM prompt. Replacing `z.any()` with a stricter schema (e.g., `z.object({ slug: z.string(), city: z.string(), ... })`) would let the server validate inputs early and return informative 400s instead of crashing mid-prompt.
