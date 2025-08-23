// src/types/fertilization.types.ts

export interface FertilizationRequest {
  sectorId: number;
  fertilizerType: string;
  applicationDate: string; // Formato YYYY-MM-DD
  quantity: number;
  unit: string;
}

export interface FertilizationResponse {
  id: number;
  sectorId: number;
  fertilizerType: string;
  applicationDate: string;
  quantity: number;
  unit: string;
  createdAt: string; // Formato ISO 8601
  updatedAt: string; // Formato ISO 8601
}
