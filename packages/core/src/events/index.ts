import type {
  FeedbackSentiment,
  FeedbackReason,
  UncertaintyKind,
  Source,
  Suggestion,
  Template,
  GalleryItem,
  SelectOption,
  Attachment,
} from '../types/index.js';

// === Event detail interfaces ===

export interface LoquixSubmitDetail {
  content: string;
  attachments?: File[];
}

export interface LoquixStopDetail {
  messageId?: string;
}

export interface LoquixRegenerateDetail {
  messageId?: string;
}

export interface LoquixFeedbackDetail {
  messageId?: string;
  sentiment: FeedbackSentiment;
  comment?: string;
}

export interface LoquixBranchDetail {
  fromMessageId: string;
}

export interface LoquixCopyDetail {
  messageId?: string;
  content?: string;
}

export interface LoquixModeChangeDetail {
  from: string;
  to: string;
}

export interface LoquixModelChangeDetail {
  from: string;
  to: string;
}

export interface LoquixChangeDetail {
  value: string;
}

export interface LoquixPauseDetail {
  messageId?: string;
}

export interface LoquixResumeDetail {
  messageId?: string;
}

export interface LoquixEditDetail {
  messageId: string;
  content: string;
}

export interface LoquixEditStartDetail {
  messageId: string;
  content: string;
}

export interface LoquixEditSubmitDetail {
  messageId: string;
  oldContent: string;
  newContent: string;
}

export interface LoquixEditCancelDetail {
  messageId: string;
}

// === Onboarding events (Phase 2) ===

export interface LoquixSuggestionSelectDetail {
  suggestion: Suggestion;
}

export interface LoquixTemplateSelectDetail {
  template: Template;
}

export interface LoquixTemplatePickerOpenDetail {}

export interface LoquixTemplatePickerCloseDetail {}

export interface LoquixGallerySelectDetail {
  item: GalleryItem;
}

export interface LoquixNudgeDismissDetail {
  nudgeId: string;
}

export interface LoquixNudgeActionDetail {
  nudgeId: string;
  action: string;
}

export interface LoquixSelectChangeDetail {
  value: string;
  option: SelectOption;
}

// === Configuration events (Phase 3) ===

export interface LoquixAttachmentAddDetail {
  attachments: Attachment[];
}

export interface LoquixAttachmentRemoveDetail {
  attachment: Attachment;
}

export interface LoquixAttachmentRetryDetail {
  attachment: Attachment;
}

export interface LoquixAttachmentClickDetail {
  attachment: Attachment;
}

export interface LoquixParameterChangeDetail {
  id: string;
  value: unknown;
  values: Record<string, unknown>;
}

export interface LoquixParameterCommitDetail {
  id: string;
  value: unknown;
  values: Record<string, unknown>;
}

export interface LoquixPresetChangeDetail {
  preset: string;
}

export interface LoquixFilterChangeDetail {
  values: string[];
  negativePrompt?: string;
}

export interface LoquixDropDetail {
  files: File[];
}

export interface LoquixPasteFilesDetail {
  files: File[];
}

// === Confidence & Uncertainty events (Phase 4 PR #2) ===

export interface LoquixFeedbackSubmitDetail {
  messageId?: string;
  sentiment: FeedbackSentiment;
  reason?: FeedbackReason;
  comment?: string;
}

export interface LoquixCorrectionSubmitDetail {
  messageId?: string;
  correction: string;
  reason?: string;
  original?: string;
}

export interface LoquixCorrectionCancelDetail {
  messageId?: string;
}

export interface LoquixDisagreementResolveDetail {
  messageId?: string;
}

export interface LoquixUncertaintyClickDetail {
  kind: UncertaintyKind;
  reason?: string;
}

// === Reasoning & Tool Use events (Phase 4 PR #1) ===

export interface LoquixReasoningToggleDetail {
  open: boolean;
}

export interface LoquixToolCallToggleDetail {
  /** Tool name (matches the `name` attribute on the component). */
  name: string;
  /**
   * Optional stable handle from the `tool-id` attribute. Useful for analytics
   * when several calls share the same `name`.
   */
  toolId?: string;
  open: boolean;
}

export interface LoquixToolGroupToggleDetail {
  open: boolean;
}

export interface LoquixCitationClickDetail {
  /** 1-based position. */
  index: number;
  source: Source;
}

/**
 * Source-list click detail. The event is dispatched as `cancelable: true`
 * before anchor navigation; calling `preventDefault()` on it stops the
 * underlying anchor click from navigating.
 */
export interface LoquixSourceClickDetail {
  /** 1-based position. */
  index: number;
  source: Source;
}

// === Scroll events ===

export interface LoquixScrollBottomDetail {}

export interface LoquixScrollAwayDetail {
  /** Current scrollTop value. */
  scrollTop: number;
}

// === Helper to create typed CustomEvents ===

export function createLoquixEvent<T>(
  name: string,
  detail: T,
  options?: Partial<CustomEventInit<T>>,
): CustomEvent<T> {
  return new CustomEvent<T>(name, {
    bubbles: true,
    composed: true,
    detail,
    ...options,
  });
}

// === Global event map augmentation ===

declare global {
  interface HTMLElementEventMap {
    'loquix-submit': CustomEvent<LoquixSubmitDetail>;
    'loquix-stop': CustomEvent<LoquixStopDetail>;
    'loquix-regenerate': CustomEvent<LoquixRegenerateDetail>;
    'loquix-feedback': CustomEvent<LoquixFeedbackDetail>;
    'loquix-branch': CustomEvent<LoquixBranchDetail>;
    'loquix-copy': CustomEvent<LoquixCopyDetail>;
    'loquix-mode-change': CustomEvent<LoquixModeChangeDetail>;
    'loquix-model-change': CustomEvent<LoquixModelChangeDetail>;
    'loquix-change': CustomEvent<LoquixChangeDetail>;
    'loquix-pause': CustomEvent<LoquixPauseDetail>;
    'loquix-resume': CustomEvent<LoquixResumeDetail>;
    'loquix-edit': CustomEvent<LoquixEditDetail>;
    'loquix-edit-start': CustomEvent<LoquixEditStartDetail>;
    'loquix-edit-submit': CustomEvent<LoquixEditSubmitDetail>;
    'loquix-edit-cancel': CustomEvent<LoquixEditCancelDetail>;
    'loquix-suggestion-select': CustomEvent<LoquixSuggestionSelectDetail>;
    'loquix-template-select': CustomEvent<LoquixTemplateSelectDetail>;
    'loquix-template-picker-open': CustomEvent<LoquixTemplatePickerOpenDetail>;
    'loquix-template-picker-close': CustomEvent<LoquixTemplatePickerCloseDetail>;
    'loquix-gallery-select': CustomEvent<LoquixGallerySelectDetail>;
    'loquix-nudge-dismiss': CustomEvent<LoquixNudgeDismissDetail>;
    'loquix-nudge-action': CustomEvent<LoquixNudgeActionDetail>;
    'loquix-select-change': CustomEvent<LoquixSelectChangeDetail>;
    'loquix-attachment-add': CustomEvent<LoquixAttachmentAddDetail>;
    'loquix-attachment-remove': CustomEvent<LoquixAttachmentRemoveDetail>;
    'loquix-attachment-retry': CustomEvent<LoquixAttachmentRetryDetail>;
    'loquix-attachment-click': CustomEvent<LoquixAttachmentClickDetail>;
    'loquix-parameter-change': CustomEvent<LoquixParameterChangeDetail>;
    'loquix-parameter-commit': CustomEvent<LoquixParameterCommitDetail>;
    'loquix-preset-change': CustomEvent<LoquixPresetChangeDetail>;
    'loquix-filter-change': CustomEvent<LoquixFilterChangeDetail>;
    'loquix-drop': CustomEvent<LoquixDropDetail>;
    'loquix-paste-files': CustomEvent<LoquixPasteFilesDetail>;
    'loquix-scroll-bottom': CustomEvent<LoquixScrollBottomDetail>;
    'loquix-scroll-away': CustomEvent<LoquixScrollAwayDetail>;
    'loquix-feedback-submit': CustomEvent<LoquixFeedbackSubmitDetail>;
    'loquix-correction-submit': CustomEvent<LoquixCorrectionSubmitDetail>;
    'loquix-correction-cancel': CustomEvent<LoquixCorrectionCancelDetail>;
    'loquix-disagreement-resolve': CustomEvent<LoquixDisagreementResolveDetail>;
    'loquix-uncertainty-click': CustomEvent<LoquixUncertaintyClickDetail>;
    'loquix-reasoning-toggle': CustomEvent<LoquixReasoningToggleDetail>;
    'loquix-tool-call-toggle': CustomEvent<LoquixToolCallToggleDetail>;
    'loquix-tool-group-toggle': CustomEvent<LoquixToolGroupToggleDetail>;
    'loquix-citation-click': CustomEvent<LoquixCitationClickDetail>;
    'loquix-source-click': CustomEvent<LoquixSourceClickDetail>;
  }
}
