import type { Call, CueBall, PenaltyPoints } from '../domain/types';

export const CALL_LABEL: Record<Call, string> = {
  NO_FOUL: 'No foul',
  FOUL: 'FOUL',
  FOUL_AND_A_MISS: 'FOUL AND A MISS',
  FREE_BALL: 'FREE BALL',
  TOUCHING_BALL: 'TOUCHING BALL',
  PENALTY: 'PENALTY',
};
export const CUE_BALL_LABEL: Record<CueBall, string> = { WHERE_IT_LIES: 'Where it lies', IN_HAND: 'In-hand', REPLACED: 'Replaced' };
export const penaltyLabel = (p: PenaltyPoints): string => (p === 0 ? 'None' : String(p));
