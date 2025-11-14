/**
 * Integration Components (Phase 4 - Cycles 97-100)
 *
 * Advanced integration components that bring together all ontology-ui features
 */

// Cycle 97: ChatToComponent - Stream chat AI responses into ontology components
export { ChatToComponent } from "./ChatToComponent";
export type { ChatToComponentProps, ParsedComponent } from "./ChatToComponent";

// Cycle 98: ComponentToChat - Embed interactive ontology components in chat messages
export { ComponentToChat, ComponentToChatList } from "./ComponentToChat";
export type {
  EmbeddedComponent,
  ComponentToChatProps,
  ComponentToChatListProps,
} from "./ComponentToChat";

// Cycle 99: OntologyExplorer - Interactive explorer for 6-dimension data
export { OntologyExplorer } from "./OntologyExplorer";
export type { OntologyData, OntologyExplorerProps } from "./OntologyExplorer";

// Cycle 100: UnifiedInterface - Complete integrated interface
export { UnifiedInterface } from "./UnifiedInterface";
export type { UnifiedInterfaceProps } from "./UnifiedInterface";
