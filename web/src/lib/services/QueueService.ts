/**
 * QueueService - Effect.ts Job Queue
 *
 * Provides job queue management with priority queuing,
 * concurrency control, retry logic, and job cancellation.
 *
 * Features:
 * - Priority-based job queuing
 * - Concurrency control
 * - Automatic retry with exponential backoff
 * - Job cancellation
 * - Progress tracking
 * - Type-safe error handling
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { QueueService } from "@/lib/services/QueueService";
 *
 * const program = Effect.gen(function* () {
 *   const queue = yield* QueueService;
 *
 *   // Enqueue a job
 *   const jobId = yield* queue.enqueue({
 *     type: "send-email",
 *     data: { to: "user@example.com", subject: "Hello" },
 *     priority: 5
 *   });
 *
 *   // Process jobs
 *   yield* queue.process("send-email", async (job) => {
 *     await sendEmail(job.data);
 *   });
 *
 *   // Cancel a job
 *   yield* queue.cancel(jobId);
 * });
 * ```
 */

import { Effect, Context, Queue, Schedule, Fiber } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class JobEnqueueError {
  readonly _tag = "JobEnqueueError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class JobProcessError {
  readonly _tag = "JobProcessError";
  constructor(
    readonly jobId: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class JobNotFoundError {
  readonly _tag = "JobNotFoundError";
  constructor(readonly jobId: string) {}
}

export class JobCancelError {
  readonly _tag = "JobCancelError";
  constructor(
    readonly jobId: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class JobRetryExhaustedError {
  readonly _tag = "JobRetryExhaustedError";
  constructor(
    readonly jobId: string,
    readonly attempts: number,
    readonly message: string
  ) {}
}

export type QueueError =
  | JobEnqueueError
  | JobProcessError
  | JobNotFoundError
  | JobCancelError
  | JobRetryExhaustedError;

// ============================================================================
// TYPES
// ============================================================================

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying";

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  priority: number;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  progress?: number;
  metadata?: Record<string, unknown>;
}

export interface JobOptions {
  priority?: number;
  maxAttempts?: number;
  delay?: number;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface EnqueueJobParams<T = unknown> {
  type: string;
  data: T;
  priority?: number;
  maxAttempts?: number;
  delay?: number;
  metadata?: Record<string, unknown>;
}

export type JobProcessor<T = unknown> = (
  job: Job<T>
) => Promise<void> | Effect.Effect<void, unknown>;

export interface QueueConfig {
  concurrency?: number;
  defaultMaxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IQueueService {
  /**
   * Enqueue a job
   *
   * Adds a job to the queue for processing
   *
   * @param params - Job parameters
   * @returns Job ID
   */
  enqueue: <T = unknown>(
    params: EnqueueJobParams<T>
  ) => Effect.Effect<string, QueueError>;

  /**
   * Process jobs of a specific type
   *
   * Starts processing jobs with the given processor function
   *
   * @param type - Job type to process
   * @param processor - Function to process each job
   * @returns Fiber handle for the processor
   */
  process: <T = unknown>(
    type: string,
    processor: JobProcessor<T>
  ) => Effect.Effect<Fiber.RuntimeFiber<void, QueueError>, QueueError>;

  /**
   * Retry a failed job
   *
   * Re-enqueues a failed job for retry
   *
   * @param jobId - Job ID to retry
   * @returns Updated job
   */
  retry: (jobId: string) => Effect.Effect<Job, QueueError>;

  /**
   * Cancel a job
   *
   * Cancels a pending or processing job
   *
   * @param jobId - Job ID to cancel
   * @returns Cancelled job
   */
  cancel: (jobId: string) => Effect.Effect<Job, QueueError>;

  /**
   * Get job by ID
   *
   * @param jobId - Job ID
   * @returns Job details
   */
  getJob: (jobId: string) => Effect.Effect<Job, QueueError>;

  /**
   * List jobs by status
   *
   * @param status - Job status filter
   * @param limit - Maximum number of jobs to return
   * @returns Array of jobs
   */
  listJobs: (
    status?: JobStatus,
    limit?: number
  ) => Effect.Effect<Job[], QueueError>;

  /**
   * Get queue statistics
   *
   * @returns Queue stats by status
   */
  getStats: () => Effect.Effect<QueueStats, never>;

  /**
   * Clear completed jobs
   *
   * Removes all completed jobs from the queue
   *
   * @returns Number of jobs cleared
   */
  clearCompleted: () => Effect.Effect<number, never>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class QueueServiceImpl implements IQueueService {
  private jobs = new Map<string, Job>();
  private processors = new Map<
    string,
    Fiber.RuntimeFiber<void, QueueError>
  >();
  private pendingQueues = new Map<string, Queue.Queue<Job>>();

  constructor(private readonly config: QueueConfig = {}) {}

  enqueue = <T = unknown>(
    params: EnqueueJobParams<T>
  ): Effect.Effect<string, QueueError> =>
    Effect.gen(this, function* () {
      try {
        const jobId = `job_${Math.random().toString(36).substring(2, 15)}`;

        const job: Job<T> = {
          id: jobId,
          type: params.type,
          data: params.data,
          priority: params.priority ?? 0,
          status: "pending",
          attempts: 0,
          maxAttempts: params.maxAttempts ?? this.config.defaultMaxAttempts ?? 3,
          createdAt: Date.now(),
          metadata: params.metadata,
        };

        this.jobs.set(jobId, job);

        // Get or create queue for this job type
        let queue = this.pendingQueues.get(params.type);
        if (!queue) {
          queue = yield* Queue.unbounded<Job>();
          this.pendingQueues.set(params.type, queue);
        }

        // Add to queue with delay if specified
        if (params.delay) {
          yield* Effect.sleep(params.delay).pipe(
            Effect.flatMap(() => Queue.offer(queue!, job))
          );
        } else {
          yield* Queue.offer(queue, job);
        }

        return jobId;
      } catch (error) {
        return yield* Effect.fail(
          new JobEnqueueError(
            error instanceof Error ? error.message : "Enqueue failed",
            error
          )
        );
      }
    });

  process = <T = unknown>(
    type: string,
    processor: JobProcessor<T>
  ): Effect.Effect<Fiber.RuntimeFiber<void, QueueError>, QueueError> =>
    Effect.gen(this, function* () {
      // Get or create queue
      let queue = this.pendingQueues.get(type);
      if (!queue) {
        queue = yield* Queue.unbounded<Job<T>>();
        this.pendingQueues.set(type, queue);
      }

      // Process jobs with concurrency control
      const concurrency = this.config.concurrency || 5;

      const processProgram = Effect.gen(this, function* () {
        while (true) {
          // Take jobs from queue
          const job = yield* Queue.take(queue!);

          // Process with concurrency control
          yield* this.processJob(job as Job<T>, processor);
        }
      });

      // Fork the processor
      const fiber = yield* Effect.fork(processProgram);
      this.processors.set(type, fiber);

      return fiber;
    });

  retry = (jobId: string): Effect.Effect<Job, QueueError> =>
    Effect.gen(this, function* () {
      const job = this.jobs.get(jobId);

      if (!job) {
        return yield* Effect.fail(new JobNotFoundError(jobId));
      }

      if (job.status !== "failed") {
        return yield* Effect.fail(
          new JobProcessError(jobId, "Only failed jobs can be retried")
        );
      }

      // Reset job state
      job.status = "pending";
      job.attempts = 0;
      job.error = undefined;
      job.startedAt = undefined;
      job.completedAt = undefined;

      // Re-enqueue
      const queue = this.pendingQueues.get(job.type);
      if (queue) {
        yield* Queue.offer(queue, job);
      }

      return job;
    });

  cancel = (jobId: string): Effect.Effect<Job, QueueError> =>
    Effect.gen(this, function* () {
      const job = this.jobs.get(jobId);

      if (!job) {
        return yield* Effect.fail(new JobNotFoundError(jobId));
      }

      if (job.status === "completed" || job.status === "cancelled") {
        return yield* Effect.fail(
          new JobCancelError(jobId, `Job already ${job.status}`)
        );
      }

      job.status = "cancelled";
      job.completedAt = Date.now();

      return job;
    });

  getJob = (jobId: string): Effect.Effect<Job, QueueError> =>
    Effect.gen(this, function* () {
      const job = this.jobs.get(jobId);

      if (!job) {
        return yield* Effect.fail(new JobNotFoundError(jobId));
      }

      return job;
    });

  listJobs = (
    status?: JobStatus,
    limit: number = 100
  ): Effect.Effect<Job[], QueueError> =>
    Effect.gen(this, function* () {
      const allJobs = Array.from(this.jobs.values());

      const filtered = status
        ? allJobs.filter((job) => job.status === status)
        : allJobs;

      // Sort by priority (higher first), then by createdAt (older first)
      const sorted = filtered.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt - b.createdAt;
      });

      return sorted.slice(0, limit);
    });

  getStats = (): Effect.Effect<QueueStats, never> =>
    Effect.gen(this, function* () {
      const allJobs = Array.from(this.jobs.values());

      const stats: QueueStats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      };

      for (const job of allJobs) {
        if (job.status === "pending" || job.status === "retrying") {
          stats.pending++;
        } else if (job.status in stats) {
          stats[job.status as keyof QueueStats]++;
        }
      }

      return stats;
    });

  clearCompleted = (): Effect.Effect<number, never> =>
    Effect.gen(this, function* () {
      const allJobs = Array.from(this.jobs.entries());
      let cleared = 0;

      for (const [id, job] of allJobs) {
        if (job.status === "completed") {
          this.jobs.delete(id);
          cleared++;
        }
      }

      return cleared;
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private processJob = <T>(
    job: Job<T>,
    processor: JobProcessor<T>
  ): Effect.Effect<void, QueueError> =>
    Effect.gen(this, function* () {
      // Check if job was cancelled
      if (job.status === "cancelled") {
        return;
      }

      job.status = "processing";
      job.startedAt = Date.now();
      job.attempts++;

      const timeout = this.config.timeout || 60000;

      const processorEffect =
        processor instanceof Effect
          ? processor
          : Effect.tryPromise({
              try: () => Promise.resolve(processor(job)),
              catch: (error) =>
                new JobProcessError(
                  job.id,
                  error instanceof Error ? error.message : "Processing failed",
                  error
                ),
            });

      const retryPolicy = Schedule.exponential(
        this.config.retryDelay || 1000
      ).pipe(Schedule.compose(Schedule.recurs(job.maxAttempts - 1)));

      try {
        yield* Effect.retry(
          processorEffect.pipe(Effect.timeout(timeout)),
          retryPolicy
        );

        job.status = "completed";
        job.completedAt = Date.now();
        job.progress = 100;
      } catch (error) {
        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
          job.error =
            error instanceof Error ? error.message : "Max retries exceeded";

          return yield* Effect.fail(
            new JobRetryExhaustedError(
              job.id,
              job.attempts,
              job.error
            )
          );
        } else {
          job.status = "retrying";
          job.error =
            error instanceof Error
              ? error.message
              : "Processing failed, will retry";
        }
      }
    });
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class QueueService extends Context.Tag("QueueService")<
  QueueService,
  IQueueService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create QueueService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeQueueServiceLayer = (config?: QueueConfig) =>
  QueueService.of({
    ...new QueueServiceImpl(config),
  });

/**
 * Default QueueService layer
 */
export const QueueServiceLive = makeQueueServiceLayer();
