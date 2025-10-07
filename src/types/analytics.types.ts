import type { IrrigationRecord } from './irrigation.types';
import type { Page } from './audit.types';

/**
 * Define la estructura de la respuesta para el resumen de riego por sector.
 * Corresponde al Endpoint 1.
 */
export interface IrrigationSectorSummary {
  sectorId: number;
  sectorName: string;
  totalWaterAmount: number;
  totalIrrigationHours: number;
}

/**
 * Define la estructura de la respuesta para la serie temporal de un sector.
 * Corresponde al Endpoint 2.
 */
export interface IrrigationTimeseriesData {
  date: string; // Formato YYYY-MM-DD
  waterAmount: number;
  irrigationHours: number;
}

/**
 * Define la respuesta paginada para los registros detallados de riego.
 * Corresponde al Endpoint 3.
 */
export type IrrigationRecordsPage = Page<IrrigationRecord>;