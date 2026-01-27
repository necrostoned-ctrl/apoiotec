import { Storage } from "../storage";

export async function seedTestData(storage: Storage) {
  console.log("🌱 Seeding test data with high volume...");
  
  try {
    // Criar 100 eventos de histórico para teste de carga
    const eventTypes = [
      'call_created', 'call_updated', 'service_created', 
      'transaction_created', 'payment_received'
    ];
    
    for (let i = 0; i < 100; i++) {
      await storage.createHistoryEvent({
        callId: Math.floor(Math.random() * 50) + 1,
        serviceId: Math.floor(Math.random() * 50) + 1,
        transactionId: null,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        description: `Evento de teste #${i + 1} - Performance test`,
        userId: Math.floor(Math.random() * 5) + 1,
        metadata: JSON.stringify({ testData: true, index: i })
      });
    }
    
    console.log("✅ Test data seeded successfully (100 events)");
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
  }
}
