/**
 * Shared shapes for interactive controls.
 *
 * Every control in this app used to spell out its own class soup, so the same
 * thing drifted between screens: the composer's Media button was a grey pill
 * and the Emoji button next to it a blue rounded square; a post's Like button
 * had no hover duration while Comment and Share did. Naming the handful of
 * shapes that actually recur means a control declares what it *is*, and the
 * look follows.
 *
 * Compose with `cn()` so a call site can still override a single property:
 * `cn(iconButton, "text-rose-500")`.
 */

/** Timing every interactive state change shares. */
export const interactive = "transition-colors duration-200";

/**
 * Icon-only control: overflow menus, close buttons, row actions.
 * Square-ish tap target that tints its background on hover.
 */
export const iconButton = `p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-50 ${interactive}`;

/**
 * Icon + label control in a toolbar strip, such as the composer's Media and
 * Emoji buttons. Same anatomy as {@link iconButton}, wider and pill-shaped
 * because it carries a word.
 */
export const toolbarButton = `flex items-center gap-1.5 p-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-50 ${interactive}`;

/**
 * Icon + count in a post's action bar (like, comment, share, bookmark).
 * The hover colour is left to the call site - that is the one thing these four
 * genuinely differ on - but everything else is shared.
 */
export const actionButton = `flex items-center gap-1.5 ${interactive}`;

/** Spring used when an action icon is pressed. Applied through `whileTap`. */
export const tapSpring = { type: "spring", stiffness: 400, damping: 10 } as const;

/** Scale an action icon reaches at the bottom of a press. */
export const tapScale = { scale: 1.25 };

/**
 * Row in a dropdown menu: the post overflow menu, the account menu. Full width,
 * icon then label, left aligned. These two menus used to disagree on weight,
 * radius and hover tint despite being the same object.
 */
export const menuItem = `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left text-muted-foreground hover:text-foreground hover:bg-accent/60 ${interactive}`;

/**
 * Control floating over an image: lightbox arrows, carousel paging, the close
 * button on a preview. Dark glass, because it sits on unknown pixels.
 */
export const overlayButton = `p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 active:scale-95 disabled:opacity-50 transition-[color,background-color,border-color,transform,opacity] duration-200`;

/**
 * Passive label floating over an image: the "2/5" counter, the "View photo"
 * hint, the filename pill. Same glass as {@link overlayButton} but inert - it
 * drifted between 60%, 65% and 70% black across three files.
 */
export const overlayChip = "px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium";
