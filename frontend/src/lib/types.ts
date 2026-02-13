export type ItemType = "food" | "toy" | "book";

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  price: number;
  effects: Record<string, number>;
};

export type ResolvedInvItem = {
  itemId: string;
  qty: number;
  item: Item | null;
};

export type InventoryResolved = {
  petId: string;
  items: ResolvedInvItem[];
};

export type Pet = {
  id: string;
  name: string;
  species: string;

  hunger: number;
  happiness: number;
  energy: number;

  strength: number;
  agility: number;
  intelligence: number;

  xp: number;
  level: number;
  coins: number;

  createdAt: string;
  updatedAt: string;
};

export type Quest = {
  id: string;
  title: string;
  goalType: "feed" | "play" | "read" | "train";
  goalCount: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  status: "available" | "active" | "completed" | "claimed";
};
