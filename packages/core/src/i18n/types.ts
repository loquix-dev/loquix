/**
 * All user-visible translation keys used by Loquix components.
 *
 * Naming convention: namespace = tag suffix in camelCase.
 * Example: `loquix-action-copy` -> `actionCopy.*`
 *
 * Interpolation uses `{variable}` syntax.
 */
export interface LoquixTranslations {
  // === loquix-action-copy ===
  'actionCopy.label': string;
  'actionCopy.copied': string;

  // === loquix-action-edit ===
  'actionEdit.triggerLabel': string;
  'actionEdit.textareaLabel': string;
  'actionEdit.submitLabel': string;
  'actionEdit.cancelLabel': string;
  'actionEdit.editingBadge': string;

  // === loquix-action-feedback ===
  'actionFeedback.positiveLabel': string;
  'actionFeedback.negativeLabel': string;

  // === loquix-message-actions ===
  'messageActions.toolbarLabel': string;
  'messageActions.regenerate': string;

  // === loquix-chat-composer ===
  'chatComposer.placeholder': string;
  'chatComposer.sendLabel': string;
  'chatComposer.stopLabel': string;

  // === loquix-prompt-input ===
  'promptInput.placeholder': string;

  // === loquix-message-item ===
  'messageItem.showMore': string;
  'messageItem.showLess': string;
  'messageItem.errorText': string;
  'messageItem.retryLabel': string;
  'messageItem.userAvatar': string;

  // === loquix-generation-controls ===
  'generationControls.toolbarLabel': string;
  'generationControls.stop': string;
  'generationControls.stopLabel': string;
  'generationControls.pause': string;
  'generationControls.pauseLabel': string;
  'generationControls.resume': string;
  'generationControls.resumeLabel': string;

  // === loquix-typing-indicator ===
  'typingIndicator.ariaLabel': string;
  'typingIndicator.thinkingMessage': string;
  'typingIndicator.workingMessage': string;

  // === loquix-template-picker ===
  'templatePicker.heading': string;
  'templatePicker.closeLabel': string;
  'templatePicker.searchPlaceholder': string;
  'templatePicker.searchLabel': string;
  'templatePicker.emptyText': string;

  // === loquix-model-selector ===
  'modelSelector.placeholder': string;
  'modelSelector.searchPlaceholder': string;
  'modelSelector.searchLabel': string;
  'modelSelector.emptyText': string;

  // === loquix-attachment-chip ===
  'attachmentChip.pending': string;
  'attachmentChip.connecting': string;
  'attachmentChip.error': string;
  'attachmentChip.uploadError': string;
  'attachmentChip.retryLabel': string;
  'attachmentChip.removeLabel': string;

  // === loquix-attachment-panel ===
  'attachmentPanel.triggerLabel': string;
  'attachmentPanel.dropOverlay': string;

  // === loquix-message-attachments ===
  'messageAttachments.removeLabel': string;
  'messageAttachments.moreCount': string;

  // === loquix-suggestion-chips ===
  'suggestionChips.ariaLabel': string;
  'suggestionChips.moreCount': string;

  // === loquix-nudge-banner ===
  'nudgeBanner.dismissLabel': string;

  // === loquix-dropdown-select ===
  'dropdownSelect.placeholder': string;
  'dropdownSelect.searchPlaceholder': string;

  // === loquix-filter-bar ===
  'filterBar.ariaLabel': string;
  'filterBar.excludeLabel': string;
  'filterBar.excludePlaceholder': string;

  // === loquix-mode-selector ===
  'modeSelector.ariaLabel': string;
  'modeSelector.selectLabel': string;

  // === loquix-parameter-panel ===
  'parameterPanel.showAdvanced': string;
  'parameterPanel.hideAdvanced': string;

  // === loquix-drop-zone ===
  'dropZone.label': string;

  // === loquix-welcome-screen ===
  'welcomeScreen.heading': string;

  // === loquix-caveat-notice ===
  'caveatNotice.message': string;

  // === loquix-chat-header ===
  'chatHeader.agentName': string;

  // === loquix-disclosure-badge ===
  'disclosureBadge.generated': string;
  'disclosureBadge.summarized': string;
  'disclosureBadge.rewrote': string;
  'disclosureBadge.suggested': string;

  // === loquix-message-avatar ===
  'messageAvatar.altFallback': string;
  'messageAvatar.namedAlt': string;
  'messageAvatar.aiAlt': string;

  // === loquix-scroll-anchor ===
  'scrollAnchor.label': string;

  // === loquix-confidence-indicator (Phase 4 PR #2) ===
  'confidenceIndicator.labelDefault': string;
  'confidenceIndicator.levelLow': string;
  'confidenceIndicator.levelMedium': string;
  'confidenceIndicator.levelHigh': string;

  // === loquix-uncertainty-marker (Phase 4 PR #2) ===
  'uncertaintyMarker.tipUnsure': string;
  'uncertaintyMarker.tipNeedsVerification': string;
  'uncertaintyMarker.tipSpeculative': string;

  // === loquix-feedback-form (Phase 4 PR #2) ===
  'feedbackForm.groupLabel': string;
  'feedbackForm.reasonsGroupLabel': string;
  'feedbackForm.helpfulLabel': string;
  'feedbackForm.notHelpfulLabel': string;
  'feedbackForm.sendLabel': string;
  'feedbackForm.cancelLabel': string;
  'feedbackForm.placeholderUp': string;
  'feedbackForm.placeholderDown': string;
  'feedbackForm.thanksMessage': string;
  'feedbackForm.reasonAccurate': string;
  'feedbackForm.reasonWellWritten': string;
  'feedbackForm.reasonHelpful': string;
  'feedbackForm.reasonInaccurate': string;
  'feedbackForm.reasonOffTopic': string;
  'feedbackForm.reasonUnsafe': string;
  'feedbackForm.reasonOther': string;

  // === loquix-correction-input (Phase 4 PR #2) ===
  'correctionInput.originalLabel': string;
  'correctionInput.correctionLabel': string;
  'correctionInput.reasonLabel': string;
  'correctionInput.reasonPlaceholder': string;
  'correctionInput.correctionPlaceholder': string;
  'correctionInput.submitLabel': string;
  'correctionInput.cancelLabel': string;
  'correctionInput.reasonRequiredMark': string;

  // === loquix-disagreement-marker (Phase 4 PR #2) ===
  'disagreementMarker.title': string;
  'disagreementMarker.markResolvedLabel': string;
  'disagreementMarker.inlineLabel': string;

  // === loquix-reasoning-block (Phase 4 PR #1) ===
  'reasoningBlock.thinking': string;
  'reasoningBlock.thoughtFor': string;
  'reasoningBlock.thoughtForMinutes': string;
  'reasoningBlock.tokensSuffix': string;
  'reasoningBlock.expandLabel': string;
  'reasoningBlock.collapseLabel': string;

  // === loquix-tool-call (Phase 4 PR #1) ===
  'toolCall.statusQueued': string;
  'toolCall.statusRunning': string;
  'toolCall.statusDone': string;
  'toolCall.statusFailed': string;
  'toolCall.argumentsLabel': string;
  'toolCall.resultLabel': string;
  'toolCall.errorLabel': string;
  'toolCall.expandLabel': string;
  'toolCall.collapseLabel': string;

  // === loquix-tool-call-list (Phase 4 PR #1) ===
  'toolCallList.summaryFallback': string;
  'toolCallList.summaryFallbackOne': string;
  'toolCallList.expandLabel': string;
  'toolCallList.collapseLabel': string;

  // === loquix-citation-popover (Phase 4 PR #1) ===
  'citationPopover.openLabel': string;

  // === loquix-source-list (Phase 4 PR #1) ===
  'sourceList.heading': string;
  'sourceList.headingOne': string;
  'sourceList.openLabel': string;
}
