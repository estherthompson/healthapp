/** JSON shapes for parsed reasoning and misinformation responses. */

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PossibleCause {
  cause: string;
  confidence: ConfidenceLevel;
  supporting_data: string[];
  alternative_explanations: string[];
}

export interface ReasoningResponse {
  safety_alert: string;
  baseline_comparison: string[];
  possible_causes: PossibleCause[];
  red_flags: string[];
  reflection_prompt: string;
  follow_up_questions: string[];
}

/** Misinformation detection mode: user pastes a claim to evaluate. */
export interface MisinformationResponse {
  claim_analyzed: string;
  evidence_confidence: 'strong' | 'moderate' | 'weak' | 'unfounded';
  common_misconceptions: string[];
  alternative_explanations: string[];
  critical_evaluation_prompt: string;
  disclaimer: string;
}
