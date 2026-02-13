import { Router } from "express";
import { store } from "../data/store";

const router = Router();

// GET /api/shop/items
router.get("/items", (_req, res) => {
  res.json({ data: Array.from(store.shopItems.values()) });
});

// POST /api/shop/buy { petId, itemId, qty }
router.post("/buy", (req, res) => {
  const { petId, itemId, qty } = req.body ?? {};
  if (!petId || typeof petId !== "string") return res.status(400).json({ error: "petId required" });
  if (!itemId || typeof itemId !== "string") return res.status(400).json({ error: "itemId required" });
  const quantity = typeof qty === "number" ? qty : 1;
  if (quantity <= 0) return res.status(400).json({ error: "qty must be > 0" });

  const pet = store.pets.get(petId);
  if (!pet) return res.status(404).json({ error: "pet not found" });

  const item = store.shopItems.get(itemId);
  if (!item) return res.status(404).json({ error: "item not found" });

  const cost = item.price * quantity;
  if (pet.coins < cost) return res.status(409).json({ error: "Not enough coins" });

  const inv = store.inventories.get(petId);
  if (!inv) return res.status(404).json({ error: "inventory not found" });

  pet.coins -= cost;

  const entry = inv.items.find(i => i.itemId === itemId);
  if (entry) entry.qty += quantity;
  else inv.items.push({ itemId, qty: quantity });

  pet.updatedAt = new Date().toISOString();

  res.json({ data: { pet, inventory: inv } });
});

export = router;

