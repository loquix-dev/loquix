/** Role of a message in the chat */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/** Current status of a message */
export type MessageStatus = 'streaming' | 'complete' | 'error' | 'pending';

/** State of the AI generation process */
export type GenerationState = 'idle' | 'running' | 'paused' | 'complete' | 'error';

/** Layout mode for the chat container */
export type ChatLayout = 'full' | 'panel' | 'floating' | 'inline';

/** Functional mode of the chat */
export type ChatMode = 'chat' | 'research' | 'build' | 'create';

/** Content type within a message */
export type MessageContentType = 'text' | 'code' | 'image' | 'file' | 'tool-result';

/** Streaming cursor variant for message content. */
export type StreamingCursorVariant = 'none' | 'caret' | 'block';

/** Avatar display variant */
export type AvatarVariant = 'icon' | 'image' | 'initials' | 'animated';

/** Avatar state reflecting the AI's activity */
export type AvatarState = 'idle' | 'thinking' | 'streaming' | 'error';

/** Size presets */
export type Size = 'xs' | 'sm' | 'md' | 'lg';

/** Typing indicator display variant */
export type TypingVariant = 'dots' | 'text' | 'steps';

/** Disclosure badge action type */
export type DisclosureAction = 'generated' | 'summarized' | 'rewrote' | 'suggested';

/** Disclosure badge display variant */
export type DisclosureVariant = 'label' | 'icon' | 'banner';

/** Caveat notice display variant */
export type CaveatVariant = 'footer' | 'inline' | 'contextual';

/** Message actions position */
export type ActionsPosition = 'hover' | 'always' | 'on-complete';

/** Placement of the actions toolbar relative to the message bubble */
export type ActionsPlacement = 'bottom-start' | 'bottom-end' | 'inline-start' | 'inline-end';

/** Prompt input variant */
export type PromptVariant = 'chat' | 'inline' | 'command' | 'panel';

/** Chat composer layout variant */
export type ComposerVariant = 'default' | 'contained';

/** Feedback sentiment */
export type FeedbackSentiment = 'positive' | 'negative';

// === Confidence & Uncertainty (Phase 4 PR #2) ===

/** Confidence indicator display variant */
export type ConfidenceVariant = 'bar' | 'dots' | 'badge' | 'numeric';

/** Derived confidence level */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** Uncertainty marker classification */
export type UncertaintyKind = 'unsure' | 'needs-verification' | 'speculative';

/** Uncertainty marker display variant */
export type UncertaintyVariant = 'underline' | 'highlight' | 'icon';

/** Disagreement marker display variant */
export type DisagreementVariant = 'inline' | 'banner';

/**
 * Stable feedback reason identifiers. Localised labels live in i18n
 * (`feedbackForm.reason{Accurate,WellWritten,Helpful,Inaccurate,OffTopic,Unsafe,Other}`);
 * the event payload always carries the stable ID, never a localised string.
 */
export type FeedbackReason =
  | 'accurate'
  | 'well-written'
  | 'helpful'
  | 'inaccurate'
  | 'off-topic'
  | 'unsafe'
  | 'other';

// === Reasoning & Tool Use (Phase 4 PR #1) ===

/** Reasoning block lifecycle. */
export type ReasoningStatus = 'thinking' | 'done';

/** Tool call lifecycle. */
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

/** Source list display variant. */
export type SourceListLayout = 'grid' | 'list';

/**
 * A single source entry referenced by a citation chip and listed in source-list.
 * `id` is optional but recommended for analytics — it lets consumers reconcile
 * citations with sources when several share the same numeric index across turns.
 */
export interface Source {
  /** Optional stable identifier (analytics, de-dup). */
  id?: string;
  /** Human-readable title of the source. */
  title: string;
  /** URL to navigate to. Validated against an http(s) allowlist before rendering. */
  url: string;
  /** Display host (e.g. "arxiv.org"). Optional. */
  host?: string;
  /** Snippet text shown in the popover and source-list rows. Optional. */
  snippet?: string;
  /** Favicon URL. Validated against the same http(s) allowlist as `url`. Optional. */
  favicon?: string;
}

// === Onboarding types (Phase 2) ===

/** A suggestion item for chips, welcome screens, and follow-ups */
export interface Suggestion {
  id: string;
  text: string;
  icon?: string;
  description?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

/** A template item for template cards and pickers */
export interface Template {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  prompt: string;
  metadata?: Record<string, unknown>;
}

/** A gallery example item */
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  prompt: string;
  metadata?: Record<string, unknown>;
}

/** Suggestion chip display variant */
export type SuggestionVariant = 'chip' | 'pill' | 'card';

/** Follow-up suggestions layout variant */
export type FollowUpVariant = 'inline' | 'stacked' | 'carousel';

/** Nudge banner variant */
export type NudgeVariant = 'info' | 'tip' | 'warning';

/** Example gallery display variant */
export type GalleryVariant = 'grid' | 'list' | 'carousel';

/** Welcome screen layout */
export type WelcomeScreenLayout = 'centered' | 'split';

// === Dropdown types ===

/** An option item for the dropdown select */
export interface SelectOption {
  /** Unique value for this option */
  value: string;
  /** Primary label text */
  label: string;
  /** Secondary description shown below the label */
  description?: string;
  /** Icon or emoji shown before the label */
  icon?: string;
  /** Tooltip/hint text shown on hover */
  hint?: string;
  /** Group name for grouping options under a header */
  group?: string;
  /** Item type: regular option, clickable action, or visual separator */
  type?: 'option' | 'action' | 'separator';
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Trailing badge text (e.g. "+1 -1") */
  badge?: string;
  /** Show external link icon on the right */
  external?: boolean;
  /** Show submenu arrow on the right (auto-set when children is provided) */
  hasSubmenu?: boolean;
  /** Nested options for a submenu. Setting this implicitly enables hasSubmenu. */
  children?: SelectOption[];
}

// === Configuration types (Phase 3) ===

/** Mode selector rendering variant */
export type ModeSelectorVariant = 'tabs' | 'dropdown' | 'pills' | 'toggle';

/** A selectable AI operating mode */
export interface ModeOption {
  /** Unique mode identifier (e.g. 'chat', 'research') */
  value: string;
  /** Human-readable label */
  label: string;
  /** Icon or emoji */
  icon?: string;
  /** Short description of the mode */
  description?: string;
}

/** A selectable LLM model with tier/cost metadata */
export interface ModelOption {
  /** Unique model identifier (e.g. 'gpt-4o') */
  value: string;
  /** Display name */
  label: string;
  /** Description of model capabilities */
  description?: string;
  /** Icon or emoji */
  icon?: string;
  /** Tier label (e.g. 'pro', 'standard', 'free') */
  tier?: string;
  /** Cost indicator (e.g. '$0.02/1k tokens') */
  cost?: string;
  /** Capability tags (e.g. ['vision', 'code', 'reasoning']) */
  capabilities?: string[];
  /** Group name for grouped display */
  group?: string;
  /** Whether this model is disabled */
  disabled?: boolean;
}

/** Status of a file attachment */
export type AttachmentStatus = 'pending' | 'uploading' | 'complete' | 'error';

/** Purpose of a file attachment */
export type AttachmentPurpose = 'style' | 'subject' | 'source';

/** A file attachment item */
export interface Attachment {
  /** Unique identifier */
  id: string;
  /** The File object (for uploads) */
  file?: File;
  /** URL if already hosted */
  url?: string;
  /** Display filename */
  filename: string;
  /** MIME type or extension shorthand */
  filetype: string;
  /** Size in bytes */
  size: number;
  /** Semantic purpose */
  purpose?: AttachmentPurpose;
  /** Upload/processing status */
  status: AttachmentStatus;
  /** Upload progress 0-100 */
  progress?: number;
  /** Error message when status is 'error' */
  error?: string;
}

/** Type of an AI parameter control */
export type ParameterType = 'range' | 'toggle' | 'select' | 'number';

/** Definition of a tunable AI parameter */
export interface ParameterDef {
  /** Unique parameter identifier (e.g. 'temperature') */
  id: string;
  /** Human-readable label */
  label: string;
  /** Control type to render */
  type: ParameterType;
  /** Minimum value (for range/number) */
  min?: number;
  /** Maximum value (for range/number) */
  max?: number;
  /** Step increment (for range/number) */
  step?: number;
  /** Default value */
  default?: unknown;
  /** Explanatory description */
  description?: string;
  /** Whether this is an advanced parameter */
  advanced?: boolean;
  /** Options for 'select' type */
  options?: { value: string; label: string }[];
}

/** A named preset of parameter values */
export interface ParameterPreset {
  /** Unique preset identifier */
  id: string;
  /** Display name */
  label: string;
  /** Description */
  description?: string;
  /** Map of parameter id to value */
  values: Record<string, unknown>;
}

/** A filter option for the filter bar */
export interface FilterOption {
  /** Unique filter identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon or emoji */
  icon?: string;
  /** Group name for visual grouping */
  group?: string;
}
