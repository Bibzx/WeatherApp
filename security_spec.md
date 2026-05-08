# Security Specification - WeatherTask

## Data Invariants
1. A task must have a `userId` matching the authenticated user.
2. A task must have a `title` (max 500 chars).
3. `createdAt` must be a server timestamp on creation.
4. `updatedAt` must be a server timestamp on update.
5. Users can only see and modify their own tasks.

## The Dirty Dozen Payloads
1. **Unauthorized List**: Authenticated user trying to list tasks without a `userId` filter (should be blocked by query enforcement).
2. **Identity Spoofing**: User A trying to create a task with `userId` of User B.
3. **Ghost Collection**: Trying to write to a collection not defined in the blueprint.
4. **Massive Payload**: Task title with 1MB of text.
5. **ID Poisoning**: Creating a task with a document ID containing special characters or being too long.
6. **Immutable Override**: Trying to change `userId` after task creation.
7. **Time Travel**: Providing a client-side `createdAt` timestamp.
8. **Field Injection**: Adding an `isAdmin` field to a task document.
9. **PII Leak**: Non-owner trying to read a user's private profile.
10. **State Shortcut**: Directly setting `completed: true` on a task that shouldn't exist (relational check).
11. **Type Poisoning**: Sending `completed: "not yet"` instead of `false`.
12. **Orphaned Write**: Creating a task for a userId that doesn't exist in the system (if we had a users collection lookup).

## Test Runner (Logic)
The `firestore.rules` should ensure all above payloads return `PERMISSION_DENIED`.
