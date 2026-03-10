# @loquix/react

React wrappers for [@loquix/core](https://www.npmjs.com/package/@loquix/core) Web Components.

Built with [@lit/react](https://www.npmjs.com/package/@lit/react) — provides proper React integration with full prop/event binding for all 35 Loquix components.

## Installation

```bash
npm install @loquix/react @loquix/core lit react
```

## Usage

```tsx
import { ChatContainer, ChatHeader, MessageList, MessageItem, ChatComposer } from '@loquix/react';

function App() {
  return (
    <ChatContainer>
      <ChatHeader slot="header" heading="Chat" />
      <MessageList slot="messages">
        <MessageItem role="user" content="Hello!" />
        <MessageItem role="assistant" content="Hi there!" />
      </MessageList>
      <ChatComposer slot="composer" />
    </ChatContainer>
  );
}
```

## Available Components

### Core Chat

`MessageAvatar` · `TypingIndicator` · `DisclosureBadge` · `CaveatNotice` · `ActionButton` · `ActionCopy` · `ActionFeedback` · `ActionEdit` · `MessageActions` · `MessageContent` · `GenerationControls` · `PromptInput` · `ChatComposer` · `MessageItem` · `MessageList` · `ChatHeader` · `ChatContainer`

### Wayfinding

`SuggestionChips` · `WelcomeScreen` · `FollowUpSuggestions` · `NudgeBanner` · `TemplateCard` · `TemplatePicker` · `ExampleGallery`

### Tuning & Configuration

`ComposerToolbar` · `DropdownSelect` · `AttachmentChip` · `ModeSelector` · `ModelSelector` · `AttachmentPanel` · `ParameterPanel` · `FilterBar` · `MessageAttachments`

## How It Works

Each wrapper is a thin `createComponent()` call from `@lit/react` that maps the underlying Web Component to a React component. Props, events, and slots work as expected in React — no manual `ref` wiring needed.

## Peer Dependencies

- `react` ^18.0.0 or ^19.0.0

## License

MIT
