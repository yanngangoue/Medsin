import type { InteropEnvelope } from "./types";

/**
 * Abstraction du bus d’événements : implémentation MVP en mémoire.
 * Remplacer par NATS JetStream ou Kafka sans changer les producteurs.
 */
export type EventHandler = (evt: InteropEnvelope) => Promise<void>;

export interface InteropEventBus {
  publish(evt: InteropEnvelope): Promise<void>;
  subscribe(type: string, handler: EventHandler): void;
}

const memory = new Map<string, EventHandler[]>();

export class InMemoryInteropEventBus implements InteropEventBus {
  async publish(evt: InteropEnvelope): Promise<void> {
    const list = memory.get(evt.type) ?? [];
    await Promise.all(list.map((h) => h(evt)));
    const wild = memory.get("*") ?? [];
    await Promise.all(wild.map((h) => h(evt)));
  }

  subscribe(type: string, handler: EventHandler): void {
    const list = memory.get(type) ?? [];
    list.push(handler);
    memory.set(type, list);
  }
}

let singleton: InteropEventBus = new InMemoryInteropEventBus();

export function getInteropEventBus(): InteropEventBus {
  return singleton;
}

/** Tests / substitution NATS */
export function setInteropEventBus(bus: InteropEventBus): void {
  singleton = bus;
}
