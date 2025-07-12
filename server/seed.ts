import { db } from "./db";
import { users, restaurants, categories, reviews } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  const defaultCategories = [
    { name: "Comida", createdBy: "admin", status: "approved" },
    { name: "Atendimento", createdBy: "admin", status: "approved" },
    { name: "Ambiente", createdBy: "admin", status: "approved" },
    { name: "Preço", createdBy: "admin", status: "approved" },
    { name: "Limpeza", createdBy: "admin", status: "approved" },
    { name: "Velocidade", createdBy: "admin", status: "approved" },
  ];

  try {
    // Lógica corrigida: Insere cada categoria padrão apenas se ela não existir.
    console.log("Verificando e inserindo categorias padrão...");
    for (const category of defaultCategories) {
      const existing = await db.select().from(categories).where(eq(categories.name, category.name));
      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`Categoria "${category.name}" criada.`);
      }
    }
    
    // O resto da lógica para criar usuários de teste, etc., permanece o mesmo.
    const adminUser = {
      firebaseUid: "admin-sample-uid",
      email: "admin@opinalocal.com",
      name: "Admin OpinaLocal",
      role: "admin", // Garante que o usuário de seed seja admin
      photoURL: null,
    };

    const existingAdmin = await db.select().from(users).where(eq(users.firebaseUid, adminUser.firebaseUid));
    
    if (existingAdmin.length === 0) {
      // ... (o resto do seu código para criar restaurantes e avaliações de exemplo)
    } else {
      console.log("Usuário admin de exemplo já existe.");
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Executa a função
seedDatabase().then(() => {
  console.log("Processo de seeding finalizado.");
  // Adiciona uma pequena pausa para garantir que todas as operações assíncronas terminem
  setTimeout(() => process.exit(0), 1000);
});