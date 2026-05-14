import type { QuestionStatus } from "../types";

const map: Record<QuestionStatus, string> = {
  OPEN: "bg-blue-500/20 text-blue-300",
  DISCUSSION: "bg-yellow-500/20 text-yellow-300",
  SOLVED: "bg-emerald-500/25 text-emerald-300",
  RESOLVED: "bg-green-500/20 text-green-300",
  CLOSED: "bg-zinc-500/20 text-zinc-300"
};

export const Badge = ({ status }: { status: QuestionStatus }) => (
  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${map[status]}`}>{status}</span>
);
