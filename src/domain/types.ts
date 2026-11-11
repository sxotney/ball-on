// Domain types. Vocabulary follows /CONTEXT.md.

export type Edition = '2024-09';
export type Status = 'draft' | 'reviewed';

export type Call = 'NO_FOUL' | 'FOUL' | 'FOUL_AND_A_MISS' | 'FREE_BALL' | 'TOUCHING_BALL' | 'PENALTY';
export const CALLS: readonly Call[] = ['NO_FOUL', 'FOUL', 'FOUL_AND_A_MISS', 'FREE_BALL', 'TOUCHING_BALL', 'PENALTY'];

export type PenaltyPoints = 0 | 4 | 5 | 6 | 7;
export const PENALTY_POINTS: readonly PenaltyPoints[] = [0, 4, 5, 6, 7];

export type CueBall = 'WHERE_IT_LIES' | 'IN_HAND' | 'REPLACED';
export const CUE_BALL_STATES: readonly CueBall[] = ['WHERE_IT_LIES', 'IN_HAND', 'REPLACED'];

/** Must exist in the Options List (questions/options-list.json). */
export type OptionId = string;

export interface Ruling {
  calls: Call[];
  penaltyPoints: PenaltyPoints;
  options: OptionId[];
  cueBall: CueBall;
}

export type BallColour = 'white' | 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';
export const BALL_COLOURS: readonly BallColour[] = ['white', 'red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];

/** Coordinates in mm on the playing area: x 0–1778 across, y 0–3569 from the Top Cushion. */
export interface DiagramBall { ball: BallColour; x: number; y: number }
export interface Diagram { balls: DiagramBall[]; caption?: string }

interface Base {
  id: string;
  topic: string;
  edition: Edition;
  status: Status;
  citations: string[];
  prompt: string;
  diagram?: Diagram;
}

export interface Scenario extends Base { kind: 'scenario'; ruling: Ruling; explanation: string }

export type RecallAnswer =
  | { type: 'number'; value: number }
  | { type: 'choice'; choices: string[]; correct: string };

export interface Recall extends Base { kind: 'recall'; answer: RecallAnswer; explanation: string }
export interface JudgementCall extends Base { kind: 'judgement'; considerations: string }

export type Question = Scenario | Recall | JudgementCall;

export interface OptionDef { id: OptionId; label: string; citation: string }
export interface Topic { slug: string; title: string }
export interface Bank { topics: Topic[]; options: OptionDef[]; questions: Question[] }
