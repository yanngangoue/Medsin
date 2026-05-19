/**
 * Suivi livraison : consomme DeliveryStatusUpdated, expose temps réel (SSE/WebSocket en phase 2).
 */

async function main(): Promise<void> {
  console.info("[logistics-tracker] MVP : persister statuts + notifier app patient (push)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
