"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import pubData from "@/app/data/staff/pubData.json";
import staffData from "@/app/data/staff/staffData.json";

/* Animations */
const containerVariants = {
  hidden: { opacity: 0.9 }, visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
};
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

/* Helpers */
const slugify = (s) =>
  String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildStaffLookup = (staffJson) => {
  const arr = Array.isArray(staffJson) ? staffJson : Object.values(staffJson || {}).flat();
  const bySlug = new Map();
  for (const p of arr) {
    const name = p?.name ? String(p.name) : "";
    const slug = p?.slug ? String(p.slug) : "";
    if (slug && name) bySlug.set(slug, name);
  }
  return bySlug;
};

const authorsToNames = (authors, bySlugMap) => {
  const list = Array.isArray(authors) ? authors : [];
  return list
    .map((a) => {
      if (!a) return "";
      if (typeof a === "string") return bySlugMap.get(a) || a;
      if (typeof a === "object") {
        const key = a.slug || a.name || "";
        return bySlugMap.get(key) || key;
      }
      return "";
    })
    .filter(Boolean);
};

const normalizePublication = (p, bySlugMap) => {
  return {
    title: p.title || "",
    year: typeof p.year === "number" || typeof p.year === "string" ? String(p.year) : "",
    domain: p.domain || "",
    kind: p.kind || "",
    description: p.description || "",
    authors: authorsToNames(p.authors, bySlugMap),
    docUrl: p.docUrl || p.url || p.link || p.doi || "",   
  };
};

/* Bib generator */
const bibEscape = (s = "") =>
  String(s)
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const asBibType = (kind) => {
  const k = String(kind || "").toLowerCase();
  if (k.includes("review") || k.includes("article")) return "article";
  if (k.includes("paper") || k.includes("conference") || k.includes("proceeding")) return "inproceedings";
  if (k.includes("thesis")) return "phdthesis";
  return "misc";
};

const makeCiteKey = (pub, idx = 0) => {
  const firstAuthor = pub.authors?.[0] || "item";
  const a = slugify(firstAuthor).replace(/-/g, "");
  const y = pub.year || "nd";
  const t = slugify(pub.title).slice(0, 24).replace(/-/g, "");
  return `${a}${y}-${t || "pub"}-${idx + 1}`;
};

const toBibEntry = (pub, idx = 0) => {
  const type = asBibType(pub.kind);
  const key = makeCiteKey(pub, idx);
  const author = pub.authors?.length ? pub.authors.join(" and ") : undefined;

  const fields = {
    title: bibEscape(pub.title),
    year: bibEscape(pub.year),
    ...(author ? { author: bibEscape(author) } : {}),
    ...(pub.description ? { abstract: bibEscape(pub.description) } : {}),
    ...(pub.domain || pub.kind ? { keywords: bibEscape([pub.domain, pub.kind].filter(Boolean).join(", ")) } : {}),
    ...(pub.docUrl ? { url: bibEscape(pub.docUrl), howpublished: bibEscape(pub.docUrl) } : {}),
    ...(pub.kind ? { note: bibEscape(pub.kind) } : {}),
    ...(pub.domain ? { institution: bibEscape(pub.domain) } : {}),
  };

  const fieldsString = Object.entries(fields)
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(",\n");

  return `@${type}{${key},\n${fieldsString}\n}\n`;
};

const downloadBibSingle = (pub, idx = 0) => {
  const entry = toBibEntry(pub, idx);
  const blob = new Blob([entry], { type: "application/x-bibtex;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${makeCiteKey(pub, idx)}.bib`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function PublicationsClient() {
  const staffBySlug = useMemo(() => buildStaffLookup(staffData), []);

  const pubs = useMemo(() => {
    const src = Array.isArray(pubData) ? pubData : [];
    return src.map((p) => normalizePublication(p, staffBySlug)).filter((p) => p.title);
  }, [staffBySlug]);

  /* State filters */
  const [q, setQ] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");

  const { yearOptions, authorOptions, domainOptions, kindOptions } = useMemo(() => {
    const years = new Set();
    const authors = new Set();
    const domains = new Set();
    const kinds = new Set();
    for (const p of pubs) {
      if (p.year) years.add(p.year);
      if (Array.isArray(p.authors)) p.authors.forEach((a) => a && authors.add(a));
      if (p.domain) domains.add(p.domain);
      if (p.kind) kinds.add(p.kind);
    }
    return {
      yearOptions: Array.from(years).sort((a, b) => Number(b) - Number(a)),
      authorOptions: Array.from(authors).sort((a, b) => a.localeCompare(b)),
      domainOptions: Array.from(domains).sort((a, b) => a.localeCompare(b)),
      kindOptions: Array.from(kinds).sort((a, b) => a.localeCompare(b)),
    };
  }, [pubs]);

  /* filtering */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return pubs.filter((p) => {
      const inSearch =
        !query ||
        `${p.title} ${p.year} ${p.domain} ${p.kind} ${(p.authors || []).join(" ")}`
          .toLowerCase()
          .includes(query);

      const inYear = !yearFilter || p.year === yearFilter;
      const inAuthor = !authorFilter || (p.authors || []).includes(authorFilter);
      const inDomain = !domainFilter || p.domain === domainFilter;
      const inKind = !kindFilter || p.kind === kindFilter;

      return inSearch && inYear && inAuthor && inDomain && inKind;
    });
  }, [pubs, q, yearFilter, authorFilter, domainFilter, kindFilter]);

  const clearFilters = () => {
    setQ("");
    setYearFilter("");
    setAuthorFilter("");
    setDomainFilter("");
    setKindFilter("");
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-6xl mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-6 md:p-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold text-center mb-8 text-blue-600 dark:text-yellow-400 text-center"
          >
            📚 Publications
          </motion.h1>

          {/* GRID: sidebar (filters) + list */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
            {/* Sidebar filters */}
            <aside className="md:-ml-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, author, type…"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All authors</option>
                  {authorOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>

                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All departments</option>
                  {domainOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={kindFilter}
                  onChange={(e) => setKindFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All types</option>
                  {kindOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full text-sm underline mt-1 opacity-80 hover:opacity-100"
                >
                  Reset filters
                </button>
              </div>
            </aside>

            {/* Publications list */}
            <div>
              {filtered.length ? (
                <ul className="space-y-4">
                  {filtered.map((p, i) => (
                    <motion.li
                      key={`${p.title}-${i}`}
                      variants={itemVariants}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {p.title}
                          </div>

                          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200 space-y-0.5">
                            <div>
                              <span className="font-medium">Authors:</span>{" "}
                              {p.authors?.length ? p.authors.join(", ") : "—"}
                            </div>
                            <div>
                              <span className="font-medium">Year:</span> {p.year || "—"}
                            </div>
                            <div>
                              <span className="font-medium">Department:</span> {p.domain || "—"}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {p.kind || "—"}
                            </div>
                            {p.description ? (
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {p.description}
                              </p>
                            ) : null}
                          </div>

                          {p.docUrl && (
                            <a
                              href={p.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm"
                              aria-label="Open publication documentation in a new tab"
                            >
                              View documentation
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 18h6" />
                              </svg>
                            </a>
                          )}
                        </div>

                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => downloadBibSingle(p, i)}
                            className="text-xs rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Download .bib for this publication"
                          >
                            ⬇️ .bib
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No publications found.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
