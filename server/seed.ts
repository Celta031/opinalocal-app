import { db } from "./db";
import { users, restaurants, categories, reviews } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  // Create default categories
  const defaultCategories = [
    { name: "Comida", createdBy: "admin", status: "approved" },
    { name: "Atendimento", createdBy: "admin", status: "approved" },
    { name: "Ambiente", createdBy: "admin", status: "approved" },
    { name: "Preço", createdBy: "admin", status: "approved" },
    { name: "Limpeza", createdBy: "admin", status: "approved" },
    { name: "Velocidade", createdBy: "admin", status: "approved" },
  ];

  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      await db.insert(categories).values(defaultCategories);
      console.log("Default categories created");
    }

    // Create admin user
    const adminUser = {
      firebaseUid: "admin-sample-uid",
      email: "admin@opinalocal.com",
      name: "Admin OpinaLocal",
      photoURL: null,
    };

    // Check if admin user exists
    const existingAdmin = await db.select().from(users).where(eq(users.firebaseUid, adminUser.firebaseUid));
    
    if (existingAdmin.length === 0) {
      const [createdAdmin] = await db.insert(users).values(adminUser).returning();
      console.log("Admin user created:", createdAdmin.id);

      // Create sample restaurants
      const sampleRestaurants = [
        {
          name: "Restaurante Dona Maria",
          address: {
            street: "Rua da Consolação, 123",
            city: "São Paulo",
            state: "SP",
            postalCode: "01234-567",
            fullAddress: "Rua da Consolação, 123 - Consolação, São Paulo - SP"
          },
          location: { lat: -23.5505, lng: -46.6333 },
          createdBy: createdAdmin.id,
          isValidated: true
        },
        {
          name: "Pizzaria Napoli",
          address: {
            street: "Rua Augusta, 456",
            city: "São Paulo", 
            state: "SP",
            postalCode: "01234-567",
            fullAddress: "Rua Augusta, 456 - Bela Vista, São Paulo - SP"
          },
          location: { lat: -23.5489, lng: -46.6388 },
          createdBy: createdAdmin.id,
          isValidated: true
        },
        {
          name: "Café Central",
          address: {
            street: "Av. Paulista, 789",
            city: "São Paulo",
            state: "SP", 
            postalCode: "01234-567",
            fullAddress: "Av. Paulista, 789 - Bela Vista, São Paulo - SP"
          },
          location: { lat: -23.5618, lng: -46.6565 },
          createdBy: createdAdmin.id,
          isValidated: true
        }
      ];

      const createdRestaurants = await db.insert(restaurants).values(sampleRestaurants).returning();
      console.log("Sample restaurants created:", createdRestaurants.length);

      // Create sample reviews
      const sampleReviews = [
        {
          userId: createdAdmin.id,
          restaurantId: createdRestaurants[0].id,
          text: "Excelente comida caseira! O ambiente é acolhedor e o atendimento é muito bom. Recomendo o prato do dia, sempre fresquinho e saboroso.",
          photos: [],
          visitDate: new Date('2024-12-15'),
          ratings: {
            standard: {
              "Comida": 5,
              "Atendimento": 4,
              "Ambiente": 4,
              "Preço": 4
            },
            custom: {
              "Custo-benefício": 5
            }
          },
          overallRating: 4.4
        },
        {
          userId: createdAdmin.id,
          restaurantId: createdRestaurants[1].id,
          text: "Pizza muito boa! Massa fina e crocante, ingredientes frescos. O ambiente é bem descontraído, perfeito para ir com a família.",
          photos: [],
          visitDate: new Date('2024-12-10'),
          ratings: {
            standard: {
              "Comida": 4,
              "Atendimento": 4,
              "Ambiente": 4,
              "Preço": 3
            },
            custom: {
              "Bom para famílias": 5
            }
          },
          overallRating: 4.0
        },
        {
          userId: createdAdmin.id,
          restaurantId: createdRestaurants[2].id,
          text: "Ótimo local para trabalhar! Wi-fi rápido, café excelente e ambiente silencioso. Os doces são irresistíveis.",
          photos: [],
          visitDate: new Date('2024-12-05'),
          ratings: {
            standard: {
              "Comida": 4,
              "Atendimento": 5,
              "Ambiente": 5,
              "Preço": 4
            },
            custom: {}
          },
          overallRating: 4.5
        }
      ];

      await db.insert(reviews).values(sampleReviews);
      console.log("Sample reviews created:", sampleReviews.length);
    } else {
      console.log("Admin user already exists");
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seedDatabase };

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}