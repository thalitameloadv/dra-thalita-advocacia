import type { SimulationDraft, SimulationResult } from "@/types/simulation";
import { calculateSimulation } from "./calculation-engine";
import { mockImport, type ImportMode, type ImportResult } from "./importer";

export const importData = async (mode: ImportMode, file: File): Promise<ImportResult> => {
  // Placeholder for future HTTP call to /import/*
  return mockImport(mode, file);
};

export const calculateDraft = async (draft: SimulationDraft): Promise<SimulationResult> => {
  // Placeholder for future POST /calculate
  return calculateSimulation(draft);
};

export type { ImportMode, ImportResult };
