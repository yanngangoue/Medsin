/**
 * MetabolicBehaviorService — consomme MetabolicIntakeRecorded / MetabolicProfileRecomputed (NATS/Kafka).
 * MVP : point d’extension pour agrégations temps réel, alertes cliniques, exports partenaires.
 */

async function main(): Promise<void> {
  const broker = process.env.NATS_URL ?? process.env.KAFKA_BROKERS ?? "";
  console.info("[metabolic-behavior-service] demarrage — broker:", Boolean(broker));
  console.info("[metabolic-behavior-service] Sujets cibles: MetabolicIntakeRecorded, MetabolicProfileRecomputed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
