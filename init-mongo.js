// utilise la DB définie, ou db par défaut
const dbName = process.env.MONGO_INITDB_DATABASE || "cs2_case_opening_mongodb";
db = db.getSiblingDB(dbName);

// crée au moins une collection + un doc (sinon la DB n’apparaît pas)
db.createCollection("seed");
db.seed.insertOne({ seededAt: new Date() });

// -----------------------------
// Collection Cases
// -----------------------------
db.createCollection("cases");
db.cases.insertMany([
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567890"),
    name: "Operation Hydra Case",
    imageUrl: "https://cdn.cases/hydra.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 0.799 },
      { rarity: "Restricted", probability: 0.16 },
      { rarity: "Classified", probability: 0.032 },
      { rarity: "Covert", probability: 0.006 },
      { rarity: "Spécial Or", probability: 0.003 }
    ]
  },
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567891"),
    name: "Galerie",
    imageUrl: "https://cdn.cases/galerie.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 0.799 },
      { rarity: "Restricted", probability: 0.16 },
      { rarity: "Classified", probability: 0.032 },
      { rarity: "Covert", probability: 0.006 },
      { rarity: "Spécial Or", probability: 0.003 }
    ]
  }
]);

// -----------------------------
// Collection Skins
// -----------------------------
// -----------------------------
// Collection Skins
// -----------------------------
db.createCollection("skins");
db.skins.insertMany([
  // ---------------- Hydra Case ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567801"),
    name: "P250 Iron Clad",
    rarity: "Mil-Spec",
    imageUrl: "https://cdn.cases/p250-ironclad.png",
    cost: 1.50,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890") // Hydra
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567802"),
    name: "AK-47 Redline",
    rarity: "Restricted",
    imageUrl: "https://cdn.cases/ak-redline.png",
    cost: 12.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567803"),
    name: "M4A1-S Guardian",
    rarity: "Classified",
    imageUrl: "https://cdn.cases/m4a1-guardian.png",
    cost: 25.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567804"),
    name: "AWP Asiimov",
    rarity: "Covert",
    imageUrl: "https://cdn.cases/awp-asiimov.png",
    cost: 80.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567805"),
    name: "Karambit Gold",
    rarity: "Spécial Or",
    imageUrl: "https://cdn.cases/karambit-gold.png",
    cost: 500.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },

  // ---------------- Galerie ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567811"),
    name: "MAC-10 Oceanic",
    rarity: "Mil-Spec",
    imageUrl: "https://cdn.cases/mac10-oceanic.png",
    cost: 1.20,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891") // Galerie
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567812"),
    name: "Desert Eagle Blaze",
    rarity: "Restricted",
    imageUrl: "https://cdn.cases/deagle-blaze.png",
    cost: 15.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567813"),
    name: "FAMAS Roll Cage",
    rarity: "Classified",
    imageUrl: "https://cdn.cases/famas-rollcage.png",
    cost: 22.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567814"),
    name: "AWP Medusa",
    rarity: "Covert",
    imageUrl: "https://cdn.cases/awp-medusa.png",
    cost: 250.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567815"),
    name: "Butterfly Knife Sapphire",
    rarity: "Spécial Or",
    imageUrl: "https://cdn.cases/butterfly-sapphire.png",
    cost: 1000.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  }
]);

// -----------------------------
// Collection Users
// -----------------------------
db.createCollection("users");
db.users.insertMany([
  {
    _id: ObjectId("66e0b5e7f1c2ab1234567800"),
    pseudo: "PlayerOne",
    password: "$2b$10$y5iTgSMo6h5Gn1CetRgY4.BsXQI0RyoMGnrwSB55KFsC8zow..0Qq", //monpassword
    role: "user",
  },
  {
    _id: ObjectId("66e0b5e7f1c2ab1234567801"),
    pseudo: "AdminUser",
    password: "$2b$10$Aua49TTzePfzV3BNB4A5F.08BsjfwUQlPYy9HE1aZoSTnbkSmWVtq", //monpassword2
    role: "admin",
  }
]);

// -----------------------------
// Collection Inventories
// -----------------------------
db.createCollection("inventories");