import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * ONE Platform - 6-Dimension Ontology Schema
 *
 * This schema implements the complete 6-dimension ontology:
 * 1. Groups   - Multi-tenant isolation + hierarchical nesting
 * 2. People   - Authorization & governance (represented as things with role metadata)
 * 3. Things   - Entity definitions (66+ types)
 * 4. Connections - Relationships (25+ types)
 * 5. Events   - Actions & audit trail (67+ types)
 * 6. Knowledge - Embeddings & RAG
 */

export default defineSchema({
  // Dimension 1: GROUPS (Multi-tenant isolation + hierarchical nesting)
  groups: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")), // For hierarchical nesting
    properties: v.any(), // Flexible properties for group-specific data
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_parent", ["parentGroupId"])
    .index("by_status", ["status"]),

  // Dimension 3: THINGS (All entities - 66+ types)
  // Note: People (Dimension 2) are represented as things with type "creator" and properties.role
  things: defineTable({
    groupId: v.id("groups"),
    type: v.string(), // 66+ entity types: user, creator, product, course, post, etc.
    name: v.string(),
    slug: v.optional(v.string()),
    properties: v.any(), // Flexible properties for type-specific data
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("published"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_group_and_type", ["groupId", "type"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // Dimension 4: CONNECTIONS (All relationships - 25+ types)
  connections: defineTable({
    groupId: v.id("groups"),
    type: v.string(), // 25+ connection types: owns, authored, purchased, enrolled_in, etc.
    fromId: v.id("things"),
    toId: v.id("things"),
    metadata: v.optional(v.any()), // Flexible metadata for connection-specific data
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_from", ["fromId"])
    .index("by_to", ["toId"])
    .index("by_from_and_type", ["fromId", "type"])
    .index("by_to_and_type", ["toId", "type"]),

  // Dimension 5: EVENTS (All actions & audit trail - 67+ types)
  events: defineTable({
    groupId: v.id("groups"),
    type: v.string(), // 67+ event types: entity_created, tokens_purchased, inference_completed, etc.
    actorId: v.optional(v.string()), // Who performed the action (person/agent)
    targetId: v.optional(v.id("things")), // What was affected
    metadata: v.optional(v.any()), // Event-specific data
    timestamp: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_target", ["targetId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_group_and_type", ["groupId", "type"]),

  // Dimension 6: KNOWLEDGE (Embeddings & RAG)
  knowledge: defineTable({
    groupId: v.id("groups"),
    embedding: v.array(v.number()), // Vector embedding
    text: v.string(), // Original text
    metadata: v.optional(v.any()), // Metadata (source, category, etc.)
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI embedding dimensions
    }),
});
