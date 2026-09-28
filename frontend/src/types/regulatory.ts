export interface RegulatorySection {
  id: string;
  act_or_rule: string;
  section_number: string;
  title: string;
  text: string;
  summary: string;
  relevance_score: number;
}

export interface RegulatoryQueryResponse {
  query: string;
  answer: string;
  matched_sections: RegulatorySection[];
  disclaimer: string;
}
