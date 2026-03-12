import { supabase } from "../../supabaseClient";
import type { StarterSpecies, UUID } from "../../domain/types";

export class GameRepository {
  async adoptPet(name: string, species: StarterSpecies, setActive = true): Promise<UUID> {
    const res = await supabase.rpc("adopt_pet", {
      p_name: name,
      p_species: species,
      p_set_active: setActive,
    });

    if (res.error) throw new Error(`adoptPet: ${res.error.message}`);
    return res.data as UUID;
  }

  async setUsername(username: string): Promise<string> {
    const res = await supabase.rpc("set_username", {
      p_username: username,
    });

    if (res.error) throw new Error(`setUsername: ${res.error.message}`);
    return res.data as string;
  }

  async resetGame(): Promise<void> {
    const res = await supabase.rpc("reset_game");
    if (res.error) throw new Error(`resetGame: ${res.error.message}`);
  }

  async setActivePet(petId: UUID): Promise<void> {
    const res = await supabase.rpc("set_active_pet", {
      p_pet_id: petId,
    });

    if (res.error) throw new Error(`setActivePet: ${res.error.message}`);
  }

  async buyItem(petId: UUID, itemId: string, qty: number): Promise<void> {
    const res = await supabase.rpc("buy_item", {
      p_pet_id: petId,
      p_item_id: itemId,
      p_qty: qty,
    });

    if (res.error) throw new Error(`buyItem: ${res.error.message}`);
  }

  async useItem(petId: UUID, itemId: string, qty: number): Promise<void> {
    const res = await supabase.rpc("use_item", {
      p_pet_id: petId,
      p_item_id: itemId,
      p_qty: qty,
    });

    if (res.error) throw new Error(`useItem: ${res.error.message}`);
  }

  async trainSkill(
    petId: UUID,
    skill: "strength" | "agility" | "intelligence",
  ): Promise<void> {
    const res = await supabase.rpc("train_skill", {
      p_pet_id: petId,
      p_skill: skill,
    });

    if (res.error) throw new Error(`trainSkill: ${res.error.message}`);
  }

  async submitScore(petId: UUID, gameId: string, score: number): Promise<number> {
    const res = await supabase.rpc("submit_minigame_score", {
      p_pet_id: petId,
      p_game_id: gameId,
      p_score: score,
    });

    if (res.error) throw new Error(`submitScore: ${res.error.message}`);
    return typeof res.data === "number" ? res.data : 0;
  }

  async acceptQuest(questId: string, petId: UUID): Promise<void> {
    const res = await supabase.rpc("accept_quest", {
      p_quest_id: questId,
      p_pet_id: petId,
    });

    if (res.error) throw new Error(`acceptQuest: ${res.error.message}`);
  }

  async completeQuest(playerQuestId: UUID): Promise<void> {
    const res = await supabase.rpc("complete_quest", {
      p_player_quest_id: playerQuestId,
    });

    if (res.error) throw new Error(`completeQuest: ${res.error.message}`);
  }

  async abandonQuest(playerQuestId: UUID): Promise<void> {
    const res = await supabase.rpc("abandon_quest", {
      p_player_quest_id: playerQuestId,
    });

    if (res.error) throw new Error(`abandonQuest: ${res.error.message}`);
  }

  async awardXp(petId: UUID, amount: number): Promise<void> {
    const res = await supabase.rpc("award_xp", {
      p_pet_id: petId,
      p_amount: amount,
    });

    if (res.error) throw new Error(`awardXp: ${res.error.message}`);
  }
}