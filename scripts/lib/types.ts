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

export interface DocImage {
  src: string;
  title: string;
  place: string;
  number: string;
}

export interface ExportResult {
  files: string[];
  sheet: string;
}

export interface SheetItem {
  file: string;
  number: string;
  title: string;
  note: string;
}

export interface Post {
  name: string;
  id: string;
}

export interface PostOptions {
  theme: string;
  lang: string;
  timezone: string;
}

export interface Shot {
  file: string;
  width: number;
  height: number;
}

export interface ImageSize {
  width: number;
  height: number;
}
