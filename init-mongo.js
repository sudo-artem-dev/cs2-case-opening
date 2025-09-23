// utilise la DB définie, ou db par défaut
const dbName = process.env.MONGO_INITDB_DATABASE;
db = db.getSiblingDB(dbName);

// -----------------------------
// Collection Cases
// -----------------------------
db.createCollection("cases");
db.cases.insertMany([
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567890"),
    name: "Operation Hydra",
    imageUrl: "hydra.png",
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
    imageUrl: "galerie.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 60 },
      { rarity: "Restricted", probability: 15 },
      { rarity: "Classified", probability: 12},
      { rarity: "Covert", probability: 8 },
      { rarity: "Spécial Or", probability: 5 }
    ]
  },
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567892"),
    name: "Dreams & Nightmares",
    imageUrl: "dreams.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 60 },
      { rarity: "Restricted", probability: 15 },
      { rarity: "Classified", probability: 12},
      { rarity: "Covert", probability: 8 },
      { rarity: "Spécial Or", probability: 5 }
    ]
  },
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567893"),
    name: "Prisma",
    imageUrl: "prisma.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 60 },
      { rarity: "Restricted", probability: 15 },
      { rarity: "Classified", probability: 12},
      { rarity: "Covert", probability: 8 },
      { rarity: "Spécial Or", probability: 5 }
    ]
  },
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567894"),
    name: "Danger Zone",
    imageUrl: "danger.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 60 },
      { rarity: "Restricted", probability: 15 },
      { rarity: "Classified", probability: 12},
      { rarity: "Covert", probability: 8 },
      { rarity: "Spécial Or", probability: 5 }
    ]
  },
  {
    _id: ObjectId("66e0b3e6f1c2ab1234567895"),
    name: "CS20",
    imageUrl: "cs20.png",
    rarityProbabilities: [
      { rarity: "Mil-Spec", probability: 60 },
      { rarity: "Restricted", probability: 15 },
      { rarity: "Classified", probability: 12},
      { rarity: "Covert", probability: 8 },
      { rarity: "Spécial Or", probability: 5 }
    ]
  }
]);

// -----------------------------
// Collection Skins (corrigée)
// -----------------------------
db.createCollection("skins");
db.skins.insertMany([

  // ---------------- Hydra Case ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567801"),
    name: "MAG-7 | Hard Water",
    rarity: "Mil-Spec",
    imageUrl: "water.png",
    cost: 1.50,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890") // Hydra
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567802"),
    name: "FAMAS | Macabre",
    rarity: "Mil-Spec",
    imageUrl: "macabre.png",
    cost: 3.10,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567803"),
    name: "SSG 08 | Death Head",
    rarity: "Restricted",
    imageUrl: "head.png",
    cost: 12.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567804"),
    name: "P2000 | Woodsman",
    rarity: "Restricted",
    imageUrl: "woodsman.png",
    cost: 6.74,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567805"),
    name: "Galil AR | Sugar Rush",
    rarity: "Classified",
    imageUrl: "sugar.png",
    cost: 30.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567806"),
    name: "Dual Berettas | Cobra Strike",
    rarity: "Classified",
    imageUrl: "cobra.png",
    cost: 27.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567807"),
    name: "AWP | Oni Taiji",
    rarity: "Covert",
    imageUrl: "asiimov.png",
    cost: 80.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567808"),
    name: "Five-SeveN | Hyper Beast",
    rarity: "Covert",
    imageUrl: "hyper.png",
    cost: 155.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567809"),
    name: "Sport Gloves | Hedge Maze",
    rarity: "Spécial Or",
    imageUrl: "hedge.png",
    cost: 3400.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567890")
  },

  // ---------------- Galerie ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567810"),
    name: "MP5-SD | Statics",
    rarity: "Mil-Spec",
    imageUrl: "statics.png",
    cost: 0.95,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891") // Galerie
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567811"),
    name: "AUG | Luxe Trim",
    rarity: "Mil-Spec",
    imageUrl: "luxe.png",
    cost: 1.10,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567812"),
    name: "MAC-10 | Saibā Oni",
    rarity: "Restricted",
    imageUrl: "oni.png",
    cost: 15.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567813"),
    name: "Dual Berettas | Hydro Strike",
    rarity: "Restricted",
    imageUrl: "strike.png",
    cost: 6.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567814"),
    name: "AK-47 | The Outsiders",
    rarity: "Classified",
    imageUrl: "outsiders.png",
    cost: 22.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567815"),
    name: "UMP-45 | Neo-Noir",
    rarity: "Classified",
    imageUrl: "neo.png",
    cost: 30.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567816"),
    name: "M4A1-S | Vaporwave",
    rarity: "Covert",
    imageUrl: "vaporwave.png",
    cost: 360.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567817"),
    name: "Glock-18 | Gold Toof",
    rarity: "Covert",
    imageUrl: "toof.png",
    cost: 118.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567818"),
    name: "Kukri Knife | Fade",
    rarity: "Spécial Or",
    imageUrl: "fade.png",
    cost: 664.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567891")
  },

  // ---------------- Dreams & Nightmares ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567819"),
    name: "SCAR-20 | Poultrygeist",
    rarity: "Mil-Spec",
    imageUrl: "poultrygeist.png",
    cost: 0.29,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892") // Dreams
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567820"),
    name: "Five-SeveN | Scrawl",
    rarity: "Mil-Spec",
    imageUrl: "scrawl.png",
    cost: 1.20,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567821"),
    name: "XM1014 | Zombie Offensive",
    rarity: "Restricted",
    imageUrl: "zombie.png",
    cost: 2.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567822"),
    name: "M4A1-S | Night Terror",
    rarity: "Restricted",
    imageUrl: "nightterror.png",
    cost: 7.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567823"),
    name: "Dual Berettas | Melondrama",
    rarity: "Classified",
    imageUrl: "melondrama.png",
    cost: 16.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567824"),
    name: "FAMAS | Rapid Eye Movement",
    rarity: "Classified",
    imageUrl: "rapid.png",
    cost: 17.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567825"),
    name: "AK-47 | Nightwish",
    rarity: "Covert",
    imageUrl: "nightwish.png",
    cost: 131.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567826"),
    name: "MP9 | Starlight Protector",
    rarity: "Covert",
    imageUrl: "protector.png",
    cost: 48.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567827"),
    name: "Butterfly Knife | Doppler Emerald",
    rarity: "Spécial Or",
    imageUrl: "gamma.png",
    cost: 19550.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567892")
  },

  // ---------------- Prisma ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567828"),
    name: "MP7 | Mischief",
    rarity: "Mil-Spec",
    imageUrl: "mischief.png",
    cost: 0.48,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893") // Prisma
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567829"),
    name: "Galil AR | Akoben",
    rarity: "Mil-Spec",
    imageUrl: "akoben.png",
    cost: 1.20,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567830"),
    name: "UMP-45 | Moonrise",
    rarity: "Restricted",
    imageUrl: "moonrise.png",
    cost: 7.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567831"),
    name: "Desert Eagle | Light Rail",
    rarity: "Restricted",
    imageUrl: "rail.png",
    cost: 17.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567832"),
    name: "AUG | Momentum",
    rarity: "Classified",
    imageUrl: "momentum.png",
    cost: 64.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567833"),
    name: "XM1014 | Incinegator",
    rarity: "Classified",
    imageUrl: "xm.png",
    cost: 57.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567834"),
    name: "Five-SeveN | Angry Mob",
    rarity: "Covert",
    imageUrl: "mob.png",
    cost: 89.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567835"),
    name: "M4A4 | The Emperor",
    rarity: "Covert",
    imageUrl: "emperor.png",
    cost: 425.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567836"),
    name: "Talon Knife | Doppler Ruby",
    rarity: "Spécial Or",
    imageUrl: "ruby.png",
    cost: 5273.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567893")
  },

  // ---------------- Danger Zone ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567837"),
    name: "MP9 | Modest Threat",
    rarity: "Mil-Spec",
    imageUrl: "threat.png",
    cost: 0.81,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894") // Danger Zone
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567838"),
    name: "Tec-9 | Fubar",
    rarity: "Mil-Spec",
    imageUrl: "fubar.png",
    cost: 2.96,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567839"),
    name: "P250 | Nevermore",
    rarity: "Restricted",
    imageUrl: "nevermore.png",
    cost: 4.46,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567840"),
    name: "MAC-10 | Pipe Down",
    rarity: "Restricted",
    imageUrl: "down.png",
    cost: 8.90,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567841"),
    name: "MP5-SD | Phosphor",
    rarity: "Classified",
    imageUrl: "phosphor.png",
    cost: 23.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567842"),
    name: "Desert Eagle | Mecha Industries",
    rarity: "Classified",
    imageUrl: "mecha.png",
    cost: 28.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567843"),
    name: "AWP | Neo-Noir",
    rarity: "Covert",
    imageUrl: "neonoir.png",
    cost: 87.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567844"),
    name: "AK-47 | Asiimov",
    rarity: "Covert",
    imageUrl: "asiimov2.png",
    cost: 497.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567845"),
    name: "Talon Knife | Slaughter",
    rarity: "Spécial Or",
    imageUrl: "talon.png",
    cost: 1076.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567894")
  },

  // ---------------- CS20 ----------------
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567846"),
    name: "Dual Berettas | Elite 1.6",
    rarity: "Mil-Spec",
    imageUrl: "elite.png",
    cost: 1.20,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895") // CS20
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567847"),
    name: "FAMAS | Decommissioned",
    rarity: "Mil-Spec",
    imageUrl: "deco.png",
    cost: 2.82,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567848"),
    name: "Glock-18 | Sacrifice",
    rarity: "Restricted",
    imageUrl: "sacrifice.png",
    cost: 6.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567849"),
    name: "M249 | Aztec",
    rarity: "Restricted",
    imageUrl: "aztec.png",
    cost: 15.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567850"),
    name: "MP9 | Hydra",
    rarity: "Classified",
    imageUrl: "mhydra.png",
    cost: 70.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567851"),
    name: "AUG | Death by Puppy",
    rarity: "Classified",
    imageUrl: "puppy.png",
    cost: 30.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567852"),
    name: "FAMAS | Commemoration",
    rarity: "Covert",
    imageUrl: "comm.png",
    cost: 54.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567853"),
    name: "AWP | Wildfire",
    rarity: "Covert",
    imageUrl: "wildfire.png",
    cost: 357.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
  },
  {
    _id: ObjectId("66e0b4c8f1c2ab1234567854"),
    name: "Classic Knife | Fade",
    rarity: "Spécial Or",
    imageUrl: "fade3.png",
    cost: 549.00,
    case_id: ObjectId("66e0b3e6f1c2ab1234567895")
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