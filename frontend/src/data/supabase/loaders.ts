import { supabase } from "../../supabaseClient";
import type {
  GameState,
  ItemDef,
  QuestDef,
  Profile,
  PetWithStats,
  PlayerQuest,
  MinigameBestScore,
  InventoryStack,
} from "../../domain/types";
import { emptyGameState } from "../../domain/types";

function assertOk<T>(res: { data: T | null; error: any }, context: string): T {
  if (res.error) {
    const msg =
      typeof res.error?.message === "string" ? res.error.message : String(res.error);
    throw new Error(`${context}: ${msg}`);
  }
  if (res.data == null) {
    throw new Error(`${context}: no data returned`);
  }
  return res.data;
}

function indexById<T extends { id: string }>(rows: T[]): Record<string, T> {
  return rows.reduce<Record<string, T>>((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});
}

function inventoryToMap(
  rows: Array<{ item_id: string; quantity: number }>,
): Record<string, InventoryStack> {
  const out: Record<string, InventoryStack> = {};
  for (const row of rows) {
    if (typeof row.quantity !== "number" || row.quantity <= 0) continue;
    out[row.item_id] = {
      itemId: row.item_id,
      quantity: row.quantity,
    };
  }
  return out;
}

async function requireUserId(): Promise<string> {
  const sessionRes = await supabase.auth.getSession();
  const session = sessionRes.data.session;
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function syncMyPetState(): Promise<void> {
  const res = await supabase.rpc("sync_my_pet_state");
  if (res.error) {
    throw new Error(`syncMyPetState: ${res.error.message}`);
  }
}

export async function loadProfile(): Promise<Profile> {
  const userId = await requireUserId();

  const res = await supabase
    .from("profiles")
    .select("id, username, active_pet_id, coins, created_at, last_seen_at")
    .eq("id", userId)
    .single();

  const row: any = assertOk(res as any, "loadProfile");

  return {
    id: row.id,
    username: row.username,
    activePetId: row.active_pet_id ?? null,
    coins: typeof row.coins === "number" ? row.coins : 0,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
  };
}

export async function loadItems(): Promise<Record<string, ItemDef>> {
  const res = await supabase
    .from("items")
    .select("id, name, description, rarity, stackable, meta")
    .order("id", { ascending: true });

  const rows: any[] = assertOk(res as any, "loadItems");

  return indexById(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      rarity: r.rarity,
      stackable: r.stackable,
      meta: (r.meta ?? {}) as any,
    })),
  );
}

export async function loadQuests(): Promise<Record<string, QuestDef>> {
  const res = await supabase
    .from("quests")
    .select("id, title, description, requirements, rewards, repeatable, level_required")
    .order("level_required", { ascending: false })
    .order("id", { ascending: true });

  const rows: any[] = assertOk(res as any, "loadQuests");

  return indexById(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      requirements: (r.requirements ?? {}) as any,
      rewards: (r.rewards ?? {}) as any,
      repeatable: !!r.repeatable,
      levelRequired: typeof r.level_required === "number" ? r.level_required : 1,
    })),
  );
}

export async function loadPetsWithStats(): Promise<PetWithStats[]> {
  const ownerId = await requireUserId();

  await syncMyPetState();

  const petsRes = await supabase
    .from("pets")
    .select("id, owner_id, name, species, adopted_at")
    .eq("owner_id", ownerId)
    .order("adopted_at", { ascending: true });

  const pets: any[] = assertOk(petsRes as any, "loadPets");

  if (pets.length === 0) return [];

  const petIds = pets.map((p) => p.id);

  const statsRes = await supabase
    .from("pet_stats")
    .select(
      "pet_id, level, xp, energy, energy_max, hunger, happiness, strength, agility, intelligence, updated_at, last_energy_regen_at, last_happiness_decay_at, last_hunger_rise_at",
    )
    .in("pet_id", petIds);

  const statsRows: any[] = assertOk(statsRes as any, "loadPetStats");

  const statsByPetId = new Map<string, any>();
  for (const s of statsRows) statsByPetId.set(s.pet_id, s);

  return pets.map((p) => {
    const s = statsByPetId.get(p.id);
    return {
      id: p.id,
      ownerId: p.owner_id,
      name: p.name,
      species: p.species,
      adoptedAt: p.adopted_at,
      stats: {
        petId: p.id,
        level: s?.level ?? 1,
        xp: s?.xp ?? 0,
        energy: s?.energy ?? 100,
        energyMax: s?.energy_max ?? 100,
        hunger: s?.hunger ?? 0,
        happiness: s?.happiness ?? 50,
        strength: s?.strength ?? 1,
        agility: s?.agility ?? 1,
        intelligence: s?.intelligence ?? 1,
        updatedAt: s?.updated_at ?? new Date().toISOString(),
        lastEnergyRegenAt: s?.last_energy_regen_at ?? new Date().toISOString(),
        lastHappinessDecayAt: s?.last_happiness_decay_at ?? new Date().toISOString(),
        lastHungerRiseAt: s?.last_hunger_rise_at ?? new Date().toISOString(),
      },
    };
  });
}

export async function loadInventory(): Promise<Record<string, InventoryStack>> {
  const ownerId = await requireUserId();

  const res = await supabase
    .from("inventory")
    .select("item_id, quantity")
    .eq("owner_id", ownerId)
    .order("item_id", { ascending: true });

  const rows: any[] = assertOk(res as any, "loadInventory");
  return inventoryToMap(rows);
}

export async function loadPlayerQuests(): Promise<PlayerQuest[]> {
  const ownerId = await requireUserId();

  const res = await supabase
    .from("player_quests")
    .select("id, owner_id, pet_id, quest_id, status, progress, accepted_at, completed_at")
    .eq("owner_id", ownerId)
    .order("accepted_at", { ascending: false });

  const rows: any[] = assertOk(res as any, "loadPlayerQuests");

  return rows.map((r) => ({
    id: r.id,
    ownerId: r.owner_id,
    petId: r.pet_id ?? null,
    questId: r.quest_id,
    status: r.status,
    progress: (r.progress ?? {}) as any,
    acceptedAt: r.accepted_at,
    completedAt: r.completed_at,
  }));
}

export async function loadBestScores(): Promise<Record<string, MinigameBestScore>> {
  const ownerId = await requireUserId();

  const res = await supabase
    .from("minigame_best_scores")
    .select("game_id, best_score, updated_at")
    .eq("owner_id", ownerId);

  const rows: any[] = assertOk(res as any, "loadBestScores");

  const out: Record<string, MinigameBestScore> = {};
  for (const r of rows) {
    out[r.game_id] = {
      gameId: r.game_id,
      bestScore: r.best_score,
      updatedAt: r.updated_at,
    };
  }
  return out;
}

export async function loadFullGameState(): Promise<GameState> {
  const [profile, itemsById, questsById, pets, inventory, playerQuests, bestScores] =
    await Promise.all([
      loadProfile(),
      loadItems(),
      loadQuests(),
      loadPetsWithStats(),
      loadInventory(),
      loadPlayerQuests(),
      loadBestScores(),
    ]);

  const derivedActivePetId = profile.activePetId ?? pets[0]?.id ?? null;

  const state = emptyGameState();
  state.profile = profile;
  state.itemsById = itemsById;
  state.questsById = questsById;
  state.pets = pets;
  state.activePetId = derivedActivePetId;
  state.inventory = inventory;
  state.playerQuests = playerQuests;
  state.bestScores = bestScores;

  return state;
}