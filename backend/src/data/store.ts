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

export function initShopItems() {
  const items: Item[] = [
    // FOOD
    { id: "food_apple", type: "food", name: "Apple", price: 5, effects: { hunger: -15, happiness: 2, xp: 1 } },
    { id: "food_burger", type: "food", name: "Burger", price: 12, effects: { hunger: -30, happiness: 4, energy: 5, xp: 2 } },
    { id: "food_cake", type: "food", name: "Cake", price: 20, effects: { hunger: -25, happiness: 8, xp: 3 } },
    { id: "food_salad", type: "food", name: "Salad", price: 10, effects: { hunger: -18, energy: 4, xp: 2 } },

    // TOYS
    { id: "toy_ball", type: "toy", name: "Ball", price: 10, effects: { happiness: 10, energy: -5, xp: 2 } },
    { id: "toy_robot", type: "toy", name: "Robot", price: 25, effects: { happiness: 15, energy: -8, xp: 4 } },
    { id: "toy_rope", type: "toy", name: "Jump Rope", price: 15, effects: { happiness: 8, energy: -6, xp: 3 } },

    // BOOKS
    { id: "book_basic", type: "book", name: "Basic Training Guide", price: 15, effects: { intelligence: 1, xp: 3 } },
    { id: "book_advanced", type: "book", name: "Advanced Strategy", price: 30, effects: { intelligence: 2, xp: 5 } },
    { id: "book_magic", type: "book", name: "Magic Compendium", price: 40, effects: { intelligence: 3, happiness: 3, xp: 7 } }
  ];

  items.forEach(i => store.shopItems.set(i.id, i));
}

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

export function createDefaultQuests(petId: string): Quest[] {
  return [
    // ===== Base Quests (immer verfügbar, repeatable) =====
    {
      id: "q_feed_2",
      title: "Füttere dein Pet 2×",
      goalType: "feed",
      goalCount: 2,
      progress: 0,
      rewardCoins: 15,
      rewardXp: 5,
      status: "available",
      minLevel: 1
    },
    {
      id: "q_play_2",
      title: "Spiele 2×",
      goalType: "play",
      goalCount: 2,
      progress: 0,
      rewardCoins: 15,
      rewardXp: 5,
      status: "available",
      minLevel: 1
    },
    {
      id: "q_read_1",
      title: "Lies 1 Buch vor",
      goalType: "read",
      goalCount: 1,
      progress: 0,
      rewardCoins: 12,
      rewardXp: 5,
      status: "available",
      minLevel: 1
    },

    // ===== Advanced Quests (ab Level 2) =====
    {
      id: "q_train_3",
      title: "Trainiere 3×",
      goalType: "train",
      goalCount: 3,
      progress: 0,
      rewardCoins: 35,
      rewardXp: 14,
      status: "available",
      minLevel: 2
    },
    {
      id: "q_play_5",
      title: "Spiele 5×",
      goalType: "play",
      goalCount: 5,
      progress: 0,
      rewardCoins: 40,
      rewardXp: 16,
      status: "available",
      minLevel: 2
    },

    // ===== Advanced Quests (ab Level 3) =====
    {
      id: "q_feed_6",
      title: "Füttere dein Pet 6×",
      goalType: "feed",
      goalCount: 6,
      progress: 0,
      rewardCoins: 60,
      rewardXp: 25,
      status: "available",
      minLevel: 3
    },
    {
      id: "q_read_4",
      title: "Lies 4 Bücher vor",
      goalType: "read",
      goalCount: 4,
      progress: 0,
      rewardCoins: 55,
      rewardXp: 24,
      status: "available",
      minLevel: 3
    }
  ];
}

export function calcLevel(xp: number) {
  return Math.floor(xp / 20) + 1;
}

export function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function touchPet(pet: Pet) {
  pet.updatedAt = nowIso();
}