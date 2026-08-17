"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTerm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("terms")
    .insert({
      user_id: user.id,
      source_language_id: formData.get("source_language_id") as string,
      source_term: (formData.get("source_term") as string).trim(),
      definition: (formData.get("definition") as string) || null,
      part_of_speech: (formData.get("part_of_speech") as string) || null,
      domain: (formData.get("domain") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/terms");
  redirect(`/terms/${data.id}`);
}

export async function updateTerm(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("terms")
    .update({
      source_language_id: formData.get("source_language_id") as string,
      source_term: (formData.get("source_term") as string).trim(),
      definition: (formData.get("definition") as string) || null,
      part_of_speech: (formData.get("part_of_speech") as string) || null,
      domain: (formData.get("domain") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/terms");
  revalidatePath(`/terms/${id}`);
}

export async function deleteTerm(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/terms");
  redirect("/terms");
}

export async function addTranslation(termId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("term_translations").insert({
    term_id: termId,
    target_language_id: formData.get("target_language_id") as string,
    translation: (formData.get("translation") as string).trim(),
    context: (formData.get("context") as string) || null,
    example_sentence_source:
      (formData.get("example_sentence_source") as string) || null,
    example_sentence_target:
      (formData.get("example_sentence_target") as string) || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/terms/${termId}`);
}

export async function deleteTranslation(id: string, termId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("term_translations")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/terms/${termId}`);
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    name: (formData.get("name") as string).trim(),
    contact_email: (formData.get("contact_email") as string) || null,
    contact_phone: (formData.get("contact_phone") as string) || null,
    date_of_contact: (formData.get("date_of_contact") as string) || null,
    request_type: (formData.get("request_type") as string) || null,
    language_pairs: (formData.get("language_pairs") as string) || null,
    event_or_due_date: (formData.get("event_or_due_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

const GOOGLE_SHEET_PREFIX = "https://docs.google.com/spreadsheets/d/";

async function fetchSheetRows(sheetUrl: string) {
  const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!idMatch) throw new Error("Could not find a Google Sheet ID in the URL.");
  const url = `${GOOGLE_SHEET_PREFIX}${idMatch[1]}/gviz/tq?tqx=out:json&gid=0`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sheet (HTTP ${res.status}).`);
  const text = await res.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse the sheet response.");
  const data = JSON.parse(jsonMatch[0]);
  const rawRows = (data.table?.rows ?? []) as Array<{
    c?: Array<{ v?: string | number | null } | null>;
  }>;
  return rawRows.map((row) => row.c ?? []);
}

export async function importGlossary(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sheetUrl = (formData.get("sheet_url") as string).trim();
  if (!sheetUrl) throw new Error("A sheet URL is required.");

  const rows = await fetchSheetRows(sheetUrl);
  if (rows.length === 0) throw new Error("The sheet is empty.");

  const header = (rows[0] ?? []).map((cell) =>
    String(cell?.v ?? "").trim().toLowerCase()
  );
  const colTerm = header.indexOf("en");
  const colTranslation = header.indexOf("es");
  const colNotes = header.indexOf("notes");
  if (colTerm === -1 || colTranslation === -1) {
    throw new Error(
      'The sheet must have "EN" and "ES" columns (first row = headers).'
    );
  }

  const { data: langs } = await supabase
    .from("languages")
    .select("id, code")
    .in("code", ["en", "es"]);
  const enLang = langs?.find((l) => l.code === "en");
  const esLang = langs?.find((l) => l.code === "es");
  if (!enLang || !esLang) {
    throw new Error("English/Spanish seed languages are missing.");
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const sourceTerm = String(row[colTerm]?.v ?? "").trim();
    const translation = String(row[colTranslation]?.v ?? "").trim();
    if (!sourceTerm || !translation) {
      skipped++;
      continue;
    }

    let termId: string | null = null;

    const { data: termData, error: termError } = await supabase
      .from("terms")
      .insert({
        user_id: user.id,
        source_language_id: enLang.id,
        source_term: sourceTerm,
        notes: (row[colNotes]?.v ? String(row[colNotes].v) : null) || null,
      })
      .select("id")
      .single();

    if (termError) {
      if (termError.code === "23505") {
        const { data: existing } = await supabase
          .from("terms")
          .select("id")
          .eq("user_id", user.id)
          .eq("source_language_id", enLang.id)
          .eq("source_term", sourceTerm)
          .maybeSingle();
        termId = existing?.id ?? null;
      } else {
        throw new Error(termError.message);
      }
    } else {
      termId = termData?.id ?? null;
    }

    if (!termId) {
      skipped++;
      continue;
    }

    const { error: transError } = await supabase
      .from("term_translations")
      .insert({
        term_id: termId,
        target_language_id: esLang.id,
        translation,
      });

    if (transError && transError.code !== "23505") {
      throw new Error(transError.message);
    }

    inserted++;
  }

  revalidatePath("/terms");
  redirect(`/terms?imported=${inserted}&skipped=${skipped}`);
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    client_id: clientId || null,
    name: (formData.get("name") as string).trim(),
    source_language_id: formData.get("source_language_id") as string,
    target_language_id: formData.get("target_language_id") as string,
    domain: (formData.get("domain") as string) || null,
    status: (formData.get("status") as string) || "active",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/projects");
}
