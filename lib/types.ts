export type Language = {
  id: string;
  code: string;
  name: string;
  native_name: string | null;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  source_language_id: string;
  target_language_id: string;
  domain: string | null;
  status: "active" | "archived" | "completed";
  created_at: string;
  source_language?: Language;
  target_language?: Language;
  client?: Client | null;
};

export type Term = {
  id: string;
  user_id: string;
  source_language_id: string;
  source_term: string;
  definition: string | null;
  part_of_speech: string | null;
  domain: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  source_language?: Language;
  term_translations?: TermTranslation[];
};

export type TermTranslation = {
  id: string;
  term_id: string;
  target_language_id: string;
  translation: string;
  context: string | null;
  example_sentence_source: string | null;
  example_sentence_target: string | null;
  created_at: string;
  target_language?: Language;
};

export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
] as const;

export const PROJECT_STATUSES = ["active", "archived", "completed"] as const;
