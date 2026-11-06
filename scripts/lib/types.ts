export interface TextRule {
  kind: string;
  pattern: RegExp;
  keep?: (match: string) => boolean;
}

export interface Finding {
  kind: string;
  text: string;
  match?: string;
}

export interface Problem extends Finding {
  file: string;
}

export interface PageInspection {
  texts: string[];
  contents: string[];
  boxes: string[];
  findings: Finding[];
}

export interface CheckOptions {
  placeholders?: boolean;
}

export interface ImageSize {
  width: number;
  height: number;
}
