import { Router } from "express";
import {
  store,
  initShopItems,
  createStarterInventory,
  createDefaultQuests,
  clamp01to100,
  calcLevel,
  touchPet
} from "../data/store";
import { Pet } from "../types/domain";

const router = Router();
initShopItems();

function requirePet(id: string) {
  const pet = store.pets.get(id);
  return pet ?? null;
}

function applyXpAndLevel(pet: Pet, addXp: number) {
  pet.xp += Math.max(0, addXp);
  pet.level = calcLevel(pet.xp);
}

function findInventory(petId: string) {
  return store.inventories.get(petId) ?? null;
}

function resolveInventory(petId: string) {
  const inv = findInventory(petId);
  if (!inv) return null;

  return {
    petId: inv.petId,
    items: inv.items.map(x => ({
      itemId: x.itemId,
      qty: x.qty,
      item: store.shopItems.get(x.itemId) ?? null
    }))
  };
}

function decItemQty(petId: string, itemId: string, qty = 1) {
  const inv = findInventory(petId);
  if (!inv) return { ok: false as const, status: 404, msg: "Inventory not found" };

  const entry = inv.items.find(i => i.itemId === itemId);
  if (!entry || entry.qty < qty) return { ok: false as const, status: 409, msg: "Not enough item quantity" };

  entry.qty -= qty;
  if (entry.qty === 0) inv.items = inv.items.filter(i => i.qty > 0);
  return { ok: true as const };
}

function progressQuests(petId: string, goalType: "feed" | "play" | "read" | "train") {
  const qs = store.quests.get(petId);
  if (!qs) return;

  for (const q of qs) {
    if (q.status === "active" && q.goalType === goalType) {
      q.progress += 1;
      if (q.progress >= q.goalCount) q.status = "completed";
    }
  }
}

// GET /api/pets/templates
router.get("/templates", (_req, res) => {
  res.json({ data: store.petTemplates });
});

// POST /api/pets  (adopt)
router.post("/", (req, res) => {
  const { name, species } = req.body ?? {};
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  if (!species || typeof species !== "string") return res.status(400).json({ error: "species is required" });

  const template = store.petTemplates.find(t => t.species === species);
  if (!template) return res.status(404).json({ error: "species not found" });

  const id = `pet_${Math.random().toString(16).slice(2, 8)}`;
  const now = new Date().toISOString();

  const pet: Pet = {
    id,
    name,
    species,
    hunger: 40,
    happiness: 60,
    energy: 70,
    strength: template.base.strength,
    agility: template.base.agility,
    intelligence: template.base.intelligence,
    xp: 0,
    level: 1,
    coins: 50,
    createdAt: now,
    updatedAt: now
  };

  store.pets.set(id, pet);
  store.inventories.set(id, createStarterInventory(id));
  store.quests.set(id, createDefaultQuests(id));

  return res.status(201).json({ data: pet });
});

// GET /api/pets/:id
router.get("/:id", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });
  res.json({ data: pet });
});

// GET /api/pets/:id/inventory  (RESOLVED)
router.get("/:id/inventory", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const resolved = resolveInventory(req.params.id);
  if (!resolved) return res.status(404).json({ error: "inventory not found" });

  res.json({ data: resolved });
});

// POST /api/pets/:id/feed (foodItemId)
router.post("/:id/feed", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const { foodItemId } = req.body ?? {};
  if (!foodItemId || typeof foodItemId !== "string") return res.status(400).json({ error: "foodItemId required" });

  const item = store.shopItems.get(foodItemId);
  if (!item || item.type !== "food") return res.status(404).json({ error: "food item not found" });

  const dec = decItemQty(pet.id, foodItemId, 1);
  if (!dec.ok) return res.status(dec.status).json({ error: dec.msg });

  pet.hunger = clamp01to100(pet.hunger + (item.effects.hunger ?? 0));
  pet.happiness = clamp01to100(pet.happiness + (item.effects.happiness ?? 0));
  pet.energy = clamp01to100(pet.energy + (item.effects.energy ?? 0));
  applyXpAndLevel(pet, item.effects.xp ?? 0);
  touchPet(pet);

  progressQuests(pet.id, "feed");

  const resolved = resolveInventory(pet.id);
  res.json({ data: { pet, inventory: resolved } });
});

// POST /api/pets/:id/play (toyItemId oder score)
router.post("/:id/play", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const { toyItemId, score } = req.body ?? {};
  if (toyItemId && typeof toyItemId !== "string") return res.status(400).json({ error: "toyItemId must be string" });

  if (pet.energy < 5) return res.status(409).json({ error: "Not enough energy" });

  if (toyItemId) {
    const item = store.shopItems.get(toyItemId);
    if (!item || item.type !== "toy") return res.status(404).json({ error: "toy item not found" });

    const dec = decItemQty(pet.id, toyItemId, 1);
    if (!dec.ok) return res.status(dec.status).json({ error: dec.msg });

    pet.happiness = clamp01to100(pet.happiness + (item.effects.happiness ?? 0));
    pet.energy = clamp01to100(pet.energy + (item.effects.energy ?? -5));
    applyXpAndLevel(pet, item.effects.xp ?? 0);
  } else {
    // minigame score route: reward based on score
    const s = typeof score === "number" ? score : 0;
    const xpGain = Math.min(10, Math.max(0, Math.floor(s / 10)));
    const coinGain = Math.min(20, Math.max(0, Math.floor(s / 5)));
    pet.happiness = clamp01to100(pet.happiness + 5);
    pet.energy = clamp01to100(pet.energy - 8);
    pet.coins += coinGain;
    applyXpAndLevel(pet, xpGain);
  }

  touchPet(pet);
  progressQuests(pet.id, "play");

  const resolved = resolveInventory(pet.id);
  res.json({ data: { pet, inventory: resolved } });
});

// POST /api/pets/:id/read (bookItemId)
router.post("/:id/read", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const { bookItemId } = req.body ?? {};
  if (!bookItemId || typeof bookItemId !== "string") return res.status(400).json({ error: "bookItemId required" });

  const item = store.shopItems.get(bookItemId);
  if (!item || item.type !== "book") return res.status(404).json({ error: "book item not found" });

  const dec = decItemQty(pet.id, bookItemId, 1);
  if (!dec.ok) return res.status(dec.status).json({ error: dec.msg });

  pet.intelligence += (item.effects.intelligence ?? 0);
  pet.happiness = clamp01to100(pet.happiness + (item.effects.happiness ?? 0));
  applyXpAndLevel(pet, item.effects.xp ?? 0);
  touchPet(pet);

  progressQuests(pet.id, "read");

  const resolved = resolveInventory(pet.id);
  res.json({ data: { pet, inventory: resolved } });
});

// POST /api/pets/:id/train (skill)
router.post("/:id/train", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const { skill } = req.body ?? {};
  if (!skill || typeof skill !== "string") return res.status(400).json({ error: "skill required" });

  if (pet.energy < 10) return res.status(409).json({ error: "Not enough energy" });

  const skillLower = skill.toLowerCase();
  if (!["strength", "agility", "intelligence"].includes(skillLower)) {
    return res.status(400).json({ error: "skill must be strength|agility|intelligence" });
  }

  if (skillLower === "strength") pet.strength += 1;
  if (skillLower === "agility") pet.agility += 1;
  if (skillLower === "intelligence") pet.intelligence += 1;

  pet.energy = clamp01to100(pet.energy - 10);
  applyXpAndLevel(pet, 6);
  touchPet(pet);

  progressQuests(pet.id, "train");

  res.json({ data: { pet } });
});

// GET /api/pets/:id/quests
router.get("/:id/quests", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const qs = store.quests.get(pet.id) ?? [];
  res.json({ data: qs });
});

// POST /api/pets/:id/quests/:questId/accept
router.post("/:id/quests/:questId/accept", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const qs = store.quests.get(pet.id) ?? [];
  const q = qs.find(x => x.id === req.params.questId);
  if (!q) return res.status(404).json({ error: "quest not found" });

  if (q.status !== "available") return res.status(409).json({ error: "quest not available" });

  q.status = "active";
  q.progress = 0;

  res.json({ data: q });
});

// POST /api/pets/:id/quests/:questId/claim
router.post("/:id/quests/:questId/claim", (req, res) => {
  const pet = requirePet(req.params.id);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const qs = store.quests.get(pet.id) ?? [];
  const q = qs.find(x => x.id === req.params.questId);
  if (!q) return res.status(404).json({ error: "quest not found" });

  if (q.status !== "completed") return res.status(409).json({ error: "quest not completed" });

  pet.coins += q.rewardCoins;
  applyXpAndLevel(pet, q.rewardXp);
  touchPet(pet);

  q.status = "claimed";

  res.json({ data: { quest: q, pet } });
});

export = router;

