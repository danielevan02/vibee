/**
 * Limits shared by the client and the server.
 *
 * These live here because both halves have to agree on them: the composer caps
 * what can be typed, the Zod schema rejects what gets sent. When the two were
 * written separately they drifted - the composer allowed six images while the
 * schema accepted four, so a five-image post uploaded successfully and was then
 * refused.
 */

/** Characters a post's body may hold. */
export const POST_CHAR_LIMIT = 280;

/** Characters a comment or a reply may hold. */
export const COMMENT_CHAR_LIMIT = 300;

/** Images that may ride along with a single post. */
export const MAX_POST_IMAGES = 6;

/** Words shown before a long body collapses behind "Read more". */
export const PREVIEW_WORD_LIMIT = 25;
