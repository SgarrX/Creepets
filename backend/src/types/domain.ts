export type ItemType = "food" | "toy" | "book";

export type Effects = Partial<{
  hunger: number;        // negative = hunger sinkt
  happiness: number;
  energy: number;
  strength: number;
  agility: number;
  intelligence: number;
  xp: number;
  coins: number;
}>;

export type Pet = {
  id: string;
  name: string;
  species: string;

  hunger: number;       // 0..100 (0 = satt)
  happiness: number;    // 0..100
  energy: number;       // 0..100

  strength: number;
  agility: number;
  intelligence: number;

  xp: number;
  level: number;
  coins: number;

  createdAt: string;
  updatedAt: string;
};

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  price: number;
  effects: Effects;
};

export type Inventory = {
  petId: string;
  items: Array<{ itemId: string; qty: number }>;
};

export type QuestStatus = "available" | "active" | "completed" | "claimed";
export type GoalType = "feed" | "play" | "read" | "train";

export type Quest = {
  id: string;
  title: string;
  goalType: GoalType;
  goalCount: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  status: QuestStatus;
};
