/**
 * Provider interfaces — pure TypeScript contracts for plugin integrations.
 *
 * These are type-only re-exports with zero runtime cost.
 * Concrete implementations live in separate packages.
 */

export type { UploadResult, UploadOptions, UploadProvider } from './upload-provider.js';

export type {
  AgentMessage,
  AgentMessageAttachment,
  AgentSendOptions,
  AgentResponse,
  AgentProvider,
} from './agent-provider.js';
