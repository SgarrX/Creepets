import { Inventory, Item, Pet, Quest } from "../types/domain";

export const store = {
  petTemplates: [
    { species: "Kougra", base: { strength: 3, agility: 2, intelligence: 1 } },
    { species: "Aisha", base: { strength: 1, agility: 2, intelligence: 3 } },
    { species: "Shoyru", base: { strength: 2, agility: 3, intelligence: 1 } }
  ],
  pets: new Map<string, Pet>(),
  inventories: new Map<string, Inventory>(),
  shopItems: new Map<string, Item>(),
  quests: new Map<string, Quest[]>() // petId -> quests
};

function nowIso() {
  return new Date().toISOString();
}

/* ========================================= */
/* SHOP ITEMS                                */
/* ========================================= */

export function initShopItems() {
  const items: Item[] = [
    /* ---------- FOOD ---------- */
    {
      id: "food_apple",
      type: "food",
      name: "Apple",
      price: 5,
      effects: { hunger: -15, happiness: 2, xp: 1 }
    },
    {
      id: "food_burger",
      type: "food",
      name: "Burger",
      price: 12,
      effects: { hunger: -30, happiness: 4, energy: 5, xp: 2 }
    },
    {
      id: "food_cake",
      type: "food",
      name: "Cake",
      price: 20,
      effects: { hunger: -25, happiness: 8, xp: 3 }
    },
    {
      id: "food_salad",
      type: "food",
      name: "Salad",
      price: 10,
      effects: { hunger: -18, energy: 4, xp: 2 }
    },

    /* ---------- TOYS ---------- */
    {
      id: "toy_ball",
      type: "toy",
      name: "Ball",
      price: 10,
      effects: { happiness: 10, energy: -5, xp: 2 }
    },
    {
      id: "toy_robot",
      type: "toy",
      name: "Robot",
      price: 25,
      effects: { happiness: 15, energy: -8, xp: 4 }
    },
    {
      id: "toy_rope",
      type: "toy",
      name: "Jump Rope",
      price: 15,
      effects: { happiness: 8, energy: -6, xp: 3 }
    },

    /* ---------- BOOKS ---------- */
    {
      id: "book_basic",
      type: "book",
      name: "Basic Training Guide",
      price: 15,
      effects: { intelligence: 1, xp: 3 }
    },
    {
      id: "book_advanced",
      type: "book",
      name: "Advanced Strategy",
      price: 30,
      effects: { intelligence: 2, xp: 5 }
    },
    {
      id: "book_magic",
      type: "book",
      name: "Magic Compendium",
      price: 40,
      effects: { intelligence: 3, happiness: 3, xp: 7 }
    }
  ];

  items.forEach(item => {
    store.shopItems.set(item.id, item);
  });
}

/* ========================================= */
/* STARTER INVENTORY                         */
/* ========================================= */

export function createStarterInventory(petId: string): Inventory {
  return {
    petId,
    items: [
      { itemId: "food_apple", qty: 2 },
      { itemId: "food_salad", qty: 1 },
      { itemId: "toy_ball", qty: 1 },
      { itemId: "book_basic", qty: 1 }
    ]
  };
}

/* ========================================= */
/* QUESTS                                    */
/* ========================================= */

export function createDefaultQuests(petId: string): Quest[] {
  return [
    {
      id: "q_feed_2",
      title: "Feed your pet twice",
      goalType: "feed",
      goalCount: 2,
      progress: 0,
      rewardCoins: 15,
      rewardXp: 5,
      status: "available"
    },
    {
      id: "q_play_3",
      title: "Play 3 times",
      goalType: "play",
      goalCount: 3,
      progress: 0,
      rewardCoins: 20,
      rewardXp: 8,
      status: "available"
    },
    {
      id: "q_read_1",
      title: "Read one book",
      goalType: "read",
      goalCount: 1,
      progress: 0,
      rewardCoins: 10,
      rewardXp: 4,
      status: "available"
    },
    {
      id: "q_train_2",
      title: "Train twice",
      goalType: "train",
      goalCount: 2,
      progress: 0,
      rewardCoins: 25,
      rewardXp: 10,
      status: "available"
    }
  ];
}

/* ========================================= */
/* GAME LOGIC HELPERS                        */
/* ========================================= */

export function calcLevel(xp: number) {
  // Level steigt alle 20 XP
  return Math.floor(xp / 20) + 1;
}

export function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function touchPet(pet: Pet) {
  pet.updatedAt = nowIso();
}
