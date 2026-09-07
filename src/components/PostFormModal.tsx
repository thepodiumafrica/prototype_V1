"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATS, LANGS } from "@/lib/constants";
import { wc } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { useLocale } from "@/components/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionary";

const CREATE_TOOLBAR: Array<[string, DictKey, string, string]> = [
  ["B", "toolbarBold", "**", "**"],
  ["I", "toolbarItalic", "*", "*"],
  ["H2", "toolbarHeading", "## ", ""],
  ["•", "toolbarBullet", "- ", ""],
  ["\"", "toolbarQuote", "> ", ""],
  ["</>", "toolbarCode", "`", "`"],
];
const EDIT_TOOLBAR: Array<[string, DictKey, string, string]> = [
  ["B", "toolbarBold", "**", "**"],
  ["I", "toolbarItalic", "*", "*"],
  ["H2", "toolbarHeading", "## ", ""],
  ["•", "toolbarBullet", "- ", ""],
];

// Ported from ThePodium_v5.html's crWrap()/edWrap(): paired formats wrap
// the selection (or the word "text" if nothing's selected); unpaired
// formats (heading, bullet) prefix the current line.
function wrapSelection(ta: HTMLTextAreaElement, before: string, after: string) {
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || "text";
  if (after) {
    ta.value = ta.value.slice(0, s) + before + sel + after + ta.value.slice(e);
  } else {
    const ls = ta.value.lastIndexOf("\n", s - 1) + 1;
    ta.value = ta.value.slice(0, ls) + before + ta.value.slice(ls);
  }
  ta.focus();
}

export type PostType = "Article" | "Forum Post";

const POST_TYPE_KEY: Record<PostType, DictKey> = {
  Article: "postTypeArticle",
  "Forum Post": "postTypeForumPost",
};

export function PostFormModal({
  mode,
  postId,
  availableTypes = ["Article"],
  defaultType,
  onClose,
}: {
  mode: "create" | "edit";
  postId?: string;
  /** Which types this user may create -- from the PERMS matrix. */
  availableTypes?: PostType[];
  defaultType?: PostType;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  // Matches openCreateModal(): honour the requested default when the user
  // is actually allowed that type, else fall back to their first option.
  const [postType, setPostType] = useState<PostType>(
    defaultType && availableTypes.includes(defaultType)
      ? defaultType
      : (availableTypes[0] ?? "Article"),
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("technology");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(mode === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !postId) return;
    (async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("title, content, category, tags, status")
        .eq("id", postId)
        .single();
      if (fetchError || !data) {
        setError(t("couldNotLoadPost"));
      } else {
        setTitle(data.title ?? "");
        setCategory(data.category || "technology");
        setTags((data.tags ?? []).join(", "));
        setStatus(data.status);
        if (contentRef.current) {
          contentRef.current.value = data.content ?? "";
          setWordCount(wc(data.content ?? ""));
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, postId]);

  function toolbar(before: string, after: string) {
    const ta = contentRef.current;
    if (!ta) return;
    wrapSelection(ta, before, after);
    setWordCount(wc(ta.value));
  }

  function parseTags(): string[] {
    return tags
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  async function handleCreate(publishStatus: "draft" | "published") {
    setError(null);
    const trimmedTitle = title.trim();
    const content = contentRef.current?.value.trim() ?? "";
    if (!trimmedTitle) return setError(t("titleRequired"));
    if (publishStatus === "published" && !content) {
      return setError(t("contentRequiredToPublish"));
    }

    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      return setError(t("signInRequired"));
    }

    const { error: insertError } = await supabase.from("posts").insert({
      creator: user.id,
      otype: postType,
      status: publishStatus,
      category,
      language,
      tags: parseTags(),
      title: trimmedTitle,
      content,
    });

    setPending(false);
    if (insertError) return setError(insertError.message);

    onClose();
    router.push(postType === "Article" ? "/articles" : "/forum");
    router.refresh();
  }

  async function handleSaveEdit(alsoPublish: boolean) {
    if (!postId) return;
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return setError(t("titleRequired"));

    setPending(true);
    const supabase = createClient();
    const update: Record<string, unknown> = {
      title: trimmedTitle,
      content: contentRef.current?.value ?? "",
      category,
      tags: parseTags(),
    };
    if (alsoPublish) {
      update.status = "published";
      update.created_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update(update)
      .eq("id", postId);

    setPending(false);
    if (updateError) return setError(updateError.message);

    onClose();
    router.refresh();
  }

  return (
    <Modal onClose={onClose}>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-lg font-bold text-text">
            {mode === "create" ? t("createHeading") : t("editPostHeading")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-lg text-text-muted"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">{t("loadingEllipsis")}</p>
      ) : (
        <>
          {mode === "create" && availableTypes.length > 1 && (
            <div className="mb-3 flex gap-2">
              {availableTypes.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPostType(pt)}
                  className={`rounded-md border px-3.5 py-1.5 text-[13px] font-medium ${
                    postType === pt
                      ? "border-amber bg-amber-faint text-amber"
                      : "border-border text-text-muted"
                  }`}
                >
                  {t(POST_TYPE_KEY[pt])}
                </button>
              ))}
            </div>
          )}

          <div className="mb-1 flex flex-wrap gap-2.5">
            <div className="min-w-[160px] flex-1">
              <label className="form-label mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {t("titleLabel")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
            <div className="w-[140px]">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {t("categoryLabel")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                {CATS.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            {mode === "create" && (
              <div className="w-[120px]">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {t("languageLabel")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  {LANGS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.l}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mb-1 flex items-center justify-between">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("contentLabel")}
            </label>
            {mode === "create" && (
              <span className="text-[11px] text-text-dim">
                {t("wordCountLabel", { n: wordCount })}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-border bg-elevated p-1.5">
            {(mode === "create" ? CREATE_TOOLBAR : EDIT_TOOLBAR).map(
              ([label, titleKey, before, after]) => (
                <button
                  key={label}
                  type="button"
                  title={t(titleKey)}
                  onClick={() => toolbar(before, after)}
                  className="min-w-[28px] rounded border border-border px-2 py-0.5 text-xs font-semibold text-text-muted"
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <textarea
            ref={contentRef}
            defaultValue=""
            onInput={(e) => setWordCount(wc(e.currentTarget.value))}
            placeholder={t("contentPlaceholder")}
            className="h-[140px] w-full rounded-b-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />

          <div className="mt-2.5">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("tagsLabel")}
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t("tagsPlaceholder")}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-border bg-red-tint px-3 py-2 text-sm text-red">
              {error}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2.5">
            {mode === "create" ? (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleCreate("published")}
                  className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
                >
                  {t("publish")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleCreate("draft")}
                  className="rounded-md border border-accent-border bg-amber-faint px-4 py-2 text-sm font-semibold text-amber disabled:opacity-50"
                >
                  {t("saveDraft")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleSaveEdit(false)}
                  className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
                >
                  {t("save")}
                </button>
                {status === "draft" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleSaveEdit(true)}
                    className="rounded-md border border-green-border bg-green-tint px-4 py-2 text-sm font-semibold text-green disabled:opacity-50"
                  >
                    {t("saveAndPublish")}
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
            >
              {t("cancel")}
            </button>
          </div>
          {mode === "create" && (
            <p className="mt-2.5 text-[11px] text-text-dim">
              {t("draftsPrivateNote")}
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
