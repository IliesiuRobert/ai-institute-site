"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { proData } from "@/app/data/proData"; 

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

const normalizeTeams = (proj) =>
  Array.isArray(proj?.teams)
    ? proj.teams.map((t) => String(t?.name || "").trim()).filter(Boolean)
    : [];

const normalizeProject = (p) => {
  const domains = Array.isArray(p?.domain)
    ? p.domain.filter((d) => typeof d === "string" && d.trim().length > 0)
    : p?.domain
    ? [String(p.domain)]
    : [];

  return {
    title: p?.title || "",
    lead: p?.lead || "",
    regions: p?.region ? [String(p.region)] : [], 
    domains,
    members: normalizeTeams(p),
  };
};

export default function ProjectsClient() {
  // ---- State filtre ----
  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [leadFilter, setLeadFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  const projects = useMemo(() => {
    const src = Array.isArray(proData) ? proData : [];
    return src.map(normalizeProject).filter((p) => p.title);
  }, []);

  const { regionOptions, domainOptions, leadOptions, memberOptions } = useMemo(() => {
    const regions = new Set();
    const domains = new Set();
    const leads = new Set();
    const members = new Set();

    for (const p of projects) {
      p.regions.forEach((r) => r && regions.add(r));
      p.domains.forEach((d) => d && domains.add(d));
      if (p.lead) leads.add(p.lead);
      p.members.forEach((m) => m && members.add(m));
    }

    return {
      regionOptions: Array.from(regions).sort((a, b) => a.localeCompare(b)),
      domainOptions: Array.from(domains).sort((a, b) => a.localeCompare(b)),
      leadOptions: Array.from(leads).sort((a, b) => a.localeCompare(b)),
      memberOptions: Array.from(members).sort((a, b) => a.localeCompare(b)),
    };
  }, [projects]);

  // filtering
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter((p) => {
      const haystack = [
        p.title,
        p.lead,
        ...p.domains,
        ...p.regions,
        ...p.members,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQ = !query || haystack.includes(query);
      const matchesRegion = !regionFilter || p.regions.includes(regionFilter);
      const matchesDomain = !domainFilter || p.domains.includes(domainFilter);
      const matchesLead = !leadFilter || p.lead === leadFilter;
      const matchesMember = !memberFilter || p.members.includes(memberFilter);

      return matchesQ && matchesRegion && matchesDomain && matchesLead && matchesMember;
    });
  }, [projects, q, regionFilter, domainFilter, leadFilter, memberFilter]);

  const clearFilters = () => {
    setQ("");
    setRegionFilter("");
    setDomainFilter("");
    setLeadFilter("");
    setMemberFilter("");
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-6xl mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-6 md:p-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold text-center mb-8 text-blue-600 dark:text-yellow-400 text-center"
          >
            🗂️ Projects
          </motion.h1>

          {/* GRID: sidebar (filters) + list */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
            {/* Sidebar filtre */}
            <aside className="md:-ml-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, lead, department…"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />

                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All regions</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
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
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All leads</option>
                  {leadOptions.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">All members</option>
                  {memberOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
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

            {/* Project list */}
            <div>
              {filtered.length ? (
                <ul className="space-y-4">
                  {filtered.map((p, i) => {
                    const projectSlug = slugify(p.title);
                    const personSlug = p.members.length ? p.members[0] : "";

                    const content = (
                      <div>
                        <div className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                          {p.title}
                        </div>
                        <div className="mt-1 text-sm text-gray-800 dark:text-gray-200 space-y-0.5">
                          <div>{p.lead ? `Lead: ${p.lead}` : "Lead: —"}</div>
                          <div>
                            {p.domains.length
                              ? `Department: ${p.domains.join(", ")}`
                              : "Department: —"}
                          </div>
                          {p.regions.length ? <div>Region: {p.regions[0]}</div> : null}
                        </div>
                      </div>
                    );

                    return (
                      <motion.li
                        key={`${p.title}-${i}`}
                        variants={itemVariants}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                      >
                        {personSlug ? (
                          <Link
                            href={`/people/staff/${encodeURIComponent(personSlug)}/${encodeURIComponent(projectSlug)}`}
                            className="block group"
                            aria-label={`Open project ${p.title || `#${i + 1}`}`}
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">No projects found.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
