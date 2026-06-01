import { Link } from "react-router-dom";
import { toLatinDigits } from "../lib/format";

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
      <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{job.title}</h3>
      <p className="mt-3 leading-relaxed opacity-90">
        {job.company_name}
        {job.area ? ` · ${job.area}` : ""}
        {job.salary ? ` · ${toLatinDigits(job.salary)} د.ك` : ""}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">
        عرض والتقديم
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      </span>
    </Link>
  );
}
