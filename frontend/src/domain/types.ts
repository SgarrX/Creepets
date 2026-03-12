export type UUID = string;

export type QuestStatus = "active" | "completed" | "abandoned";
export type StarterSpecies = "brute" | "scout" | "sage";

export type ItemEffectStat =
  | "energy"
  | "hunger"
  | "happiness"
  | "strength"
  | "agility"
  | "intelligence";

export type ItemEffect = {
  stat: ItemEffectStat;
  delta: number;
};

export type ItemMeta = {
  type?: "food" | "toy" | "book" | "potion" | string;
  tags?: string[];
  effects?: ItemEffect[];
  price?: number;
  [key: string]: unknown;
};

export type ItemDef = {
  id: string;
  name: string;
  description?: string | null;
  rarity: number;
  stackable: boolean;
  meta: ItemMeta;
};

export type InventoryStack = {
  itemId: string;
  quantity: number;
};

export type Profile = {
  id: UUID;
  username?: string | null;
  activePetId?: UUID | null;
  coins: number;
  createdAt: string;
  lastSeenAt: string;
};

export type Pet = {
  id: UUID;
  ownerId: UUID;
  name: string;
  species: string;
  adoptedAt: string;
};

export type PetStats = {
  petId: UUID;
  level: number;
  xp: number;
  energy: number;
  energyMax: number;
  hunger: number;
  happiness: number;
  strength: number;
  agility: number;
  intelligence: number;
  updatedAt: string;
  lastEnergyRegenAt: string;
  lastHappinessDecayAt: string;
  lastHungerRiseAt: string;
};

export type PetWithStats = Pet & { stats: PetStats };

export type QuestRequirement =
  | { type: "use_item"; item_type?: string; amount: number }
  | { type: "minigame_score_at_least"; score: number }
  | { type: "train_skill"; amount: number }
  | { type: "increase_stat_total"; skill?: string; amount: number }
  | { type: string; [key: string]: unknown };

export type QuestRewardItem =
  | { item_id: string; qty: number }
  | { itemId: string; quantity: number };

export type QuestReward = {
  xp?: number;
  items?: QuestRewardItem[];
  stat_upgrades?: Partial<Record<"strength" | "agility" | "intelligence", number>>;
  [key: string]: unknown;
};

export type QuestDef = {
  id: string;
  title: string;
  description?: string | null;
  requirements: QuestRequirement;
  rewards: QuestReward;
  repeatable: boolean;
  levelRequired: number;
};

export type PlayerQuest = {
  id: UUID;
  ownerId: UUID;
  petId: UUID | null;
  questId: string;
  status: QuestStatus;
  progress: Record<string, unknown>;
  acceptedAt: string;
  completedAt?: string | null;
};

export type MinigameBestScore = {
  gameId: string;
  bestScore: number;
  updatedAt: string;
};

export type GameState = {
  profile: Profile | null;
  itemsById: Record<string, ItemDef>;
  questsById: Record<string, QuestDef>;
  pets: PetWithStats[];
  activePetId: UUID | null;
  inventory: Record<string, InventoryStack>;
  playerQuests: PlayerQuest[];
  bestScores: Record<string, MinigameBestScore>;
};

export const emptyGameState = (): GameState => ({
  profile: null,
  itemsById: {},
  questsById: {},
  pets: [],
  activePetId: null,
  inventory: {},
  playerQuests: [],
  bestScores: {},
});