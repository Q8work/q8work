import { Link } from "react-router-dom";
import { toLatinDigits } from "../lib/format";
import { fileUrl } from "../lib/api";

export const JOB_SCHEMES = [
  { bg: "#d7f3f6", fg: "#0e8f9e" },
  { bg: "#dde4ff", fg: "#3b5bfd" },
  { bg: "#fde1ee", fg: "#d6336c" },
  { bg: "#ffe2df", fg: "#e8412c" },
  { bg: "#fdf2cc", fg: "#b9860b" },
  { bg: "#d7f2e1", fg: "#1f9d57" },
];

export interface BigJob {
  id: string;
  title: string;
  area?: string;
  salary?: string;
  company_name?: string;
  logo_key?: string | null;
}

// coolors-style big colorful job card with a hover shine
export function JobBigCard({ job, scheme }: { job: BigJob; scheme: { bg: string; fg: string } }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9"
      style={{ backgroundColor: scheme.bg, color: scheme.fg }}
    >
      {/* flash / shine sweep on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 z-10 w-1/3 -skew-x-12 bg-white/40 blur-md transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[450%] group-hover:opacity-0" />

      {/* company identity */}
      {job.company_name && (
        <div className="flex items-center gap-2.5">
          {fileUrl(job.logo_key) ? (
            <img
              src={fileUrl(job.logo_key)}
              alt={job.company_name}
              className="h-9 w-9 shrink-0 rounded-full bg-white object-cover ring-2 ring-white/70"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
              style={{ backgroundColor: scheme.fg, color: scheme.bg }}
            >
              {job.company_name.charAt(0)}
            </span>
          )}
          <span className="truncate text-sm font-bold opacity-80">{job.company_name}</span>
        </div>
      )}

      <h3 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{job.title}</h3>

      {/* meta footer */}
      {(job.area || job.salary) && (
        <div className="mt-5 flex items-center gap-3 border-t border-current/15 pt-4 text-sm font-semibold opacity-80">
          {job.area && (
            <span className="inline-flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {job.area}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
              {toLatinDigits(job.salary)} د.ك
            </span>
          )}
        </div>
      )}

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold">
        عرض والتقديم
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      </span>
    </Link>
  );
}
