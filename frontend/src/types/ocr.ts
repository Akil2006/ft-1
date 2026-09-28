export interface OCRItem {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
  image_id: string;
  engine: string;
}

export interface OCRResult {
  inspection_id: string;
  total_text_blocks: number;
  engine_used: string;
  items: OCRItem[];
}
