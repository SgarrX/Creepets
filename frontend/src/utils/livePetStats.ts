import { useEffect, useMemo, useState } from "react";
import type { PetStats, PetWithStats } from "../domain/types";

export function deriveLiveStats(stats: PetStats, nowMs: number): PetStats {
  const energyGain = Math.max(
    0,
    Math.floor((nowMs - new Date(stats.lastEnergyRegenAt).getTime()) / 60_000),
  );

  const happinessLoss = Math.max(
    0,
    Math.floor((nowMs - new Date(stats.lastHappinessDecayAt).getTime()) / 3_600_000),
  );

  const hungerGain = Math.max(
    0,
    Math.floor((nowMs - new Date(stats.lastHungerRiseAt).getTime()) / 3_600_000),
  );

  return {
    ...stats,
    energy: Math.min(stats.energyMax, stats.energy + energyGain),
    happiness: Math.max(0, stats.happiness - happinessLoss),
    hunger: Math.min(100, Math.max(0, stats.hunger + hungerGain)),
  };
}

export function useLivePet(pet: PetWithStats | null): PetWithStats | null {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!pet) return null;
    return {
      ...pet,
      stats: deriveLiveStats(pet.stats, nowMs),
    };
  }, [pet, nowMs]);
}