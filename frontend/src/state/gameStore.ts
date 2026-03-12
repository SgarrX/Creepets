import { create } from "zustand";
import type {
  GameState,
  UUID,
  PetWithStats,
  StarterSpecies,
} from "../domain/types";
import { emptyGameState } from "../domain/types";

import {
  loadProfile,
  loadItems,
  loadQuests,
  loadPetsWithStats,
  loadInventory,
  loadPlayerQuests,
  loadBestScores,
} from "../data/supabase/loaders";

import { GameRepository } from "../data/supabase/gameRepository";

type TrainableSkill = "strength" | "agility" | "intelligence";

type GameStore = GameState & {
  isLoading: boolean;
  lastError: string | null;
  repo: GameRepository;

  loadGame: () => Promise<void>;
  reloadDynamic: () => Promise<void>;
  clearError: () => void;
  setUsername: (username: string) => Promise<void>;

  adoptPet: (name: string, species: StarterSpecies) => Promise<void>;
  setActivePet: (petId: UUID) => Promise<void>;
  resetGame: () => Promise<void>;

  acceptQuest: (questId: string) => Promise<void>;
  completeQuestAndApplyRewards: (playerQuestId: UUID) => Promise<void>;
  abandonQuest: (playerQuestId: UUID) => Promise<void>;

  submitMinigameScore: (gameId: string, score: number) => Promise<number>;
  trainSkill: (skill: TrainableSkill) => Promise<void>;
  useItem: (itemId: string, qty: number) => Promise<void>;

  getActivePet: () => PetWithStats | null;
  countActiveQuests: () => number;
};

function deriveActivePetId(
  profileActivePetId: UUID | null | undefined,
  pets: PetWithStats[],
): UUID | null {
  if (profileActivePetId && pets.some((p) => p.id === profileActivePetId)) {
    return profileActivePetId;
  }
  return pets[0]?.id ?? null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...emptyGameState(),
  isLoading: false,
  lastError: null,
  repo: new GameRepository(),

  clearError: () => set({ lastError: null }),

  getActivePet: () => {
    const { pets, activePetId } = get();

    if (pets.length === 0) return null;
    if (!activePetId) return pets[0] ?? null;

    return pets.find((p) => p.id === activePetId) ?? pets[0] ?? null;
  },

  countActiveQuests: () =>
    get().playerQuests.filter((q) => q.status === "active").length,

  loadGame: async () => {
    set({ isLoading: true, lastError: null });

    try {
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

      const activePetId = deriveActivePetId(profile.activePetId, pets);

      set({
        profile,
        itemsById,
        questsById,
        pets,
        activePetId,
        inventory,
        playerQuests,
        bestScores,
        isLoading: false,
        lastError: null,
      });
    } catch (e: any) {
      set({
        isLoading: false,
        lastError: e?.message ?? String(e),
      });
      throw e;
    }
  },

  reloadDynamic: async () => {
    set({ isLoading: true, lastError: null });

    try {
      const [profile, pets, inventory, playerQuests, bestScores] = await Promise.all([
        loadProfile(),
        loadPetsWithStats(),
        loadInventory(),
        loadPlayerQuests(),
        loadBestScores(),
      ]);

      const activePetId = deriveActivePetId(profile.activePetId, pets);

      set({
        profile,
        pets,
        activePetId,
        inventory,
        playerQuests,
        bestScores,
        isLoading: false,
        lastError: null,
      });
    } catch (e: any) {
      set({
        isLoading: false,
        lastError: e?.message ?? String(e),
      });
      throw e;
    }
  },

  setUsername: async (username: string) => {
    set({ lastError: null });

    try {
      await get().repo.setUsername(username.trim());
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  adoptPet: async (name: string, species: StarterSpecies) => {
    set({ lastError: null });

    try {
      const existingPet = get().getActivePet();
      if (existingPet) {
        throw new Error("Du hast bereits ein Pet.");
      }

      const username = get().profile?.username?.trim();
      if (!username) {
        throw new Error("Bitte zuerst einen Username setzen.");
      }

      await get().repo.adoptPet(name.trim(), species, true);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  setActivePet: async (petId: UUID) => {
    set({ lastError: null });

    try {
      const currentPet = get().getActivePet();

      if (!currentPet) throw new Error("No pet found");
      if (currentPet.id !== petId) {
        throw new Error("Pet switching is disabled");
      }

      await get().repo.setActivePet(petId);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  resetGame: async () => {
    set({ lastError: null });

    try {
      await get().repo.resetGame();
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  acceptQuest: async (questId: string) => {
    set({ lastError: null });

    try {
      const activePet = get().getActivePet();
      if (!activePet) throw new Error("No active pet");

      await get().repo.acceptQuest(questId, activePet.id);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  completeQuestAndApplyRewards: async (playerQuestId: UUID) => {
    set({ lastError: null });

    try {
      await get().repo.completeQuest(playerQuestId);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  abandonQuest: async (playerQuestId: UUID) => {
    set({ lastError: null });

    try {
      await get().repo.abandonQuest(playerQuestId);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  submitMinigameScore: async (gameId: string, score: number) => {
    set({ lastError: null });

    try {
      const activePet = get().getActivePet();
      if (!activePet) throw new Error("No active pet");

      const coinsWon = await get().repo.submitScore(activePet.id, gameId, score);
      await get().reloadDynamic();
      return coinsWon;
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  trainSkill: async (skill) => {
    set({ lastError: null });

    try {
      const activePet = get().getActivePet();
      if (!activePet) throw new Error("No active pet");

      await get().repo.trainSkill(activePet.id, skill);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },

  useItem: async (itemId: string, qty: number) => {
    set({ lastError: null });

    try {
      const activePet = get().getActivePet();
      if (!activePet) throw new Error("No active pet");

      await get().repo.useItem(activePet.id, itemId, qty);
      await get().reloadDynamic();
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) });
      throw e;
    }
  },
}));