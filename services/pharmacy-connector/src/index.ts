/**
 * Microservice stub : écoute PharmacySyncRequested et appelle l’API partenaire.
 * En prod : remplacer le poll/queue simulé par NATS JetStream (`medsim.interop.*`) ou Kafka.
 */

async function main(): Promise<void> {
  const broker = process.env.NATS_URL ?? process.env.KAFKA_BROKERS ?? "";
  console.info("[pharmacy-connector] démarrage — broker configuré:", Boolean(broker));
  console.info("[pharmacy-connector] MVP : brancher sur bus + credentials KMS pour secrets pharmacie");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
