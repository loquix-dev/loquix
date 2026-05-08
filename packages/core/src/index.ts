// === Provider interfaces ===
export type {
  UploadProvider,
  UploadResult,
  UploadOptions,
  AgentProvider,
  AgentMessage,
  AgentMessageAttachment,
  AgentSendOptions,
  AgentResponse,
} from './providers/index.js';

// === Types ===
export type {
  MessageRole,
  MessageStatus,
  GenerationState,
  ChatLayout,
  ChatMode,
  MessageContentType,
  StreamingCursorVariant,
  AvatarVariant,
  AvatarState,
  Size,
  TypingVariant,
  DisclosureAction,
  DisclosureVariant,
  CaveatVariant,
  ActionsPosition,
  ActionsPlacement,
  PromptVariant,
  ComposerVariant,
  FeedbackSentiment,
  Suggestion,
  Template,
  GalleryItem,
  SuggestionVariant,
  FollowUpVariant,
  NudgeVariant,
  GalleryVariant,
  WelcomeScreenLayout,
  SelectOption,
  // Phase 3 Configuration types
  ModeSelectorVariant,
  ModeOption,
  ModelOption,
  AttachmentStatus,
  AttachmentPurpose,
  Attachment,
  ParameterType,
  ParameterDef,
  ParameterPreset,
  FilterOption,
  // Phase 4 PR #2 — Confidence & Uncertainty types
  ConfidenceVariant,
  ConfidenceLevel,
  UncertaintyKind,
  UncertaintyVariant,
  DisagreementVariant,
  FeedbackReason,
} from './types/index.js';

// === Events ===
export { createLoquixEvent } from './events/index.js';
export type {
  LoquixSubmitDetail,
  LoquixStopDetail,
  LoquixRegenerateDetail,
  LoquixFeedbackDetail,
  LoquixBranchDetail,
  LoquixCopyDetail,
  LoquixModeChangeDetail,
  LoquixModelChangeDetail,
  LoquixChangeDetail,
  LoquixPauseDetail,
  LoquixResumeDetail,
  LoquixEditDetail,
  LoquixEditStartDetail,
  LoquixEditSubmitDetail,
  LoquixEditCancelDetail,
  LoquixSuggestionSelectDetail,
  LoquixTemplateSelectDetail,
  LoquixTemplatePickerOpenDetail,
  LoquixTemplatePickerCloseDetail,
  LoquixGallerySelectDetail,
  LoquixNudgeDismissDetail,
  LoquixNudgeActionDetail,
  LoquixSelectChangeDetail,
  // Phase 3 Configuration events
  LoquixAttachmentAddDetail,
  LoquixAttachmentRemoveDetail,
  LoquixAttachmentRetryDetail,
  LoquixAttachmentClickDetail,
  LoquixParameterChangeDetail,
  LoquixParameterCommitDetail,
  LoquixPresetChangeDetail,
  LoquixFilterChangeDetail,
  LoquixDropDetail,
  LoquixPasteFilesDetail,
  LoquixScrollBottomDetail,
  LoquixScrollAwayDetail,
  // Phase 4 PR #2 — Confidence & Uncertainty events
  LoquixFeedbackSubmitDetail,
  LoquixCorrectionSubmitDetail,
  LoquixCorrectionCancelDetail,
  LoquixDisagreementResolveDetail,
  LoquixUncertaintyClickDetail,
} from './events/index.js';

// === Localization ===
export {
  setLocale,
  updateLocale,
  resetLocale,
  getLocale,
  LocalizeController,
} from './i18n/index.js';
export type { LoquixTranslations } from './i18n/index.js';
export { en as defaultTranslations } from './i18n/index.js';

// === Controllers ===
export { AutoScrollController } from './controllers/autoscroll.controller.js';
export type { AutoScrollControllerOptions } from './controllers/autoscroll.controller.js';
export { KeyboardController } from './controllers/keyboard.controller.js';
export type { KeyBinding } from './controllers/keyboard.controller.js';
export { ResizeController } from './controllers/resize.controller.js';
export { StreamingController } from './controllers/streaming.controller.js';
export type {
  StreamingState,
  StreamingControllerOptions,
} from './controllers/streaming.controller.js';
export { UploadController } from './controllers/upload.controller.js';
export type { UploadState, UploadControllerOptions } from './controllers/upload.controller.js';
export { AgentController } from './controllers/agent.controller.js';
export type { AgentState, AgentControllerOptions } from './controllers/agent.controller.js';

// === Component classes (for inheritance / SSR / manual define) ===
export { LoquixMessageAvatar } from './components/core/loquix-message-avatar.js';
export { LoquixTypingIndicator } from './components/core/loquix-typing-indicator.js';
export { LoquixDisclosureBadge } from './components/core/loquix-disclosure-badge.js';
export { LoquixCaveatNotice } from './components/core/loquix-caveat-notice.js';
export { LoquixActionButton } from './components/core/loquix-action-button.js';
export { LoquixActionCopy } from './components/core/loquix-action-copy.js';
export { LoquixActionFeedback } from './components/core/loquix-action-feedback.js';
export { LoquixActionEdit } from './components/core/loquix-action-edit.js';
export { LoquixMessageActions } from './components/core/loquix-message-actions.js';
export { LoquixMessageContent } from './components/core/loquix-message-content.js';
export { LoquixGenerationControls } from './components/core/loquix-generation-controls.js';
export { LoquixPromptInput } from './components/core/loquix-prompt-input.js';
export { LoquixChatComposer } from './components/core/loquix-chat-composer.js';
export { LoquixMessageItem } from './components/core/loquix-message-item.js';
export { LoquixMessageList } from './components/core/loquix-message-list.js';
export { LoquixChatHeader } from './components/core/loquix-chat-header.js';
export { LoquixChatContainer } from './components/core/loquix-chat-container.js';
export { LoquixSuggestionChips } from './components/core/loquix-suggestion-chips.js';
export { LoquixWelcomeScreen } from './components/core/loquix-welcome-screen.js';
export { LoquixFollowUpSuggestions } from './components/core/loquix-follow-up-suggestions.js';
export { LoquixNudgeBanner } from './components/core/loquix-nudge-banner.js';
export { LoquixTemplateCard } from './components/core/loquix-template-card.js';
export { LoquixTemplatePicker } from './components/core/loquix-template-picker.js';
export { LoquixExampleGallery } from './components/core/loquix-example-gallery.js';
export { LoquixComposerToolbar } from './components/core/loquix-composer-toolbar.js';
export { LoquixDropdownSelect } from './components/core/loquix-dropdown-select.js';
// Phase 3 Configuration components
export { LoquixAttachmentChip } from './components/core/loquix-attachment-chip.js';
export { LoquixModeSelector } from './components/core/loquix-mode-selector.js';
export { LoquixModelSelector } from './components/core/loquix-model-selector.js';
export { LoquixAttachmentPanel } from './components/core/loquix-attachment-panel.js';
export { LoquixParameterPanel } from './components/core/loquix-parameter-panel.js';
export { LoquixFilterBar } from './components/core/loquix-filter-bar.js';
export { LoquixDropZone } from './components/core/loquix-drop-zone.js';
export { LoquixScrollAnchor } from './components/core/loquix-scroll-anchor.js';
export { LoquixMessageAttachments } from './components/core/loquix-message-attachments.js';
// Phase 4 PR #2 — Confidence & Uncertainty components
export { LoquixConfidenceIndicator } from './components/core/loquix-confidence-indicator.js';
export { LoquixUncertaintyMarker } from './components/core/loquix-uncertainty-marker.js';
export { LoquixDisagreementMarker } from './components/core/loquix-disagreement-marker.js';
export { LoquixFeedbackForm } from './components/core/loquix-feedback-form.js';
export { LoquixCorrectionInput } from './components/core/loquix-correction-input.js';

// === Side-effect registrations (auto-define all tags) ===
import './components/core/define-message-avatar.js';
import './components/core/define-typing-indicator.js';
import './components/core/define-disclosure-badge.js';
import './components/core/define-caveat-notice.js';
import './components/core/define-action-button.js';
import './components/core/define-action-copy.js';
import './components/core/define-action-feedback.js';
import './components/core/define-action-edit.js';
import './components/core/define-message-actions.js';
import './components/core/define-message-content.js';
import './components/core/define-generation-controls.js';
import './components/core/define-prompt-input.js';
import './components/core/define-chat-composer.js';
import './components/core/define-message-item.js';
import './components/core/define-message-list.js';
import './components/core/define-chat-header.js';
import './components/core/define-chat-container.js';
import './components/core/define-suggestion-chips.js';
import './components/core/define-welcome-screen.js';
import './components/core/define-follow-up-suggestions.js';
import './components/core/define-nudge-banner.js';
import './components/core/define-template-card.js';
import './components/core/define-template-picker.js';
import './components/core/define-example-gallery.js';
import './components/core/define-composer-toolbar.js';
import './components/core/define-dropdown-select.js';
// Phase 3 Configuration registrations
import './components/core/define-attachment-chip.js';
import './components/core/define-mode-selector.js';
import './components/core/define-model-selector.js';
import './components/core/define-attachment-panel.js';
import './components/core/define-parameter-panel.js';
import './components/core/define-filter-bar.js';
import './components/core/define-drop-zone.js';
import './components/core/define-scroll-anchor.js';
import './components/core/define-message-attachments.js';
// Phase 4 PR #2 — Confidence & Uncertainty registrations
import './components/core/define-confidence-indicator.js';
import './components/core/define-uncertainty-marker.js';
import './components/core/define-disagreement-marker.js';
import './components/core/define-feedback-form.js';
import './components/core/define-correction-input.js';
