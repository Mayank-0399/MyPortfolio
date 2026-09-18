import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Award, Calendar, CheckCircle2, Flame, ShieldAlert, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Pre-computed fallback snapshot for instant rendering and offline resilience
const FALLBACK_STATS = {
  username: "Mayank_2027",
  realName: "Mayank_2027",
  profileRanking: 216591,
  rating: 1853,
  topPercentage: 6.34,
  globalRanking: 54695,
  attendedContests: 5,
  badge: "Knight candidate",
  totalSolved: 501,
  easySolved: 83,
  mediumSolved: 245,
  hardSolved: 173,
  totalSubmissions: 745,
  activeDays: 117,
  maxStreak: 18,
  latestActiveDate: "2026-09-06",
  activityMap: {}
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// LeetCode Logo SVG
function LeetCodeLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.751l3.854-4.126 5.406-5.788a1.385 1.385 0 0 0-.003-1.955 1.374 1.374 0 0 0-.968-.438z"
        fill="#B3B3B3"
      />
      <path
        d="M9.833 13.924a1.377 1.377 0 0 0 0 1.953l.006.006a1.378 1.378 0 0 0 1.953 0l6.985-6.985a1.377 1.377 0 0 0 0-1.953 1.378 1.378 0 0 0-1.953 0l-6.991 6.979z"
        fill="#FFA116"
      />
      <path
        d="M21.688 12.001H10.97a1.38 1.38 0 1 0 0 2.76h10.718a1.38 1.38 0 1 0 0-2.76z"
        fill="#FFA116"
      />
    </svg>
  );
}

export default function LeetcodeWidget() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch(`${apiUrl}/api/leetcode?username=Mayank_2027`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.totalSolved) {
            setStats(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend LeetCode endpoint unavailable:", err.message);
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  // Generate calendar grid for past 52 weeks
  const { weeks, monthLabels } = useMemo(() => {
    const refDate = stats.latestActiveDate ? new Date(stats.latestActiveDate) : new Date();
    const now = new Date();
    const endDate = refDate > now ? refDate : now;

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 52 * 7);
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const generatedWeeks = [];
    let currentWeek = [];
    const d = new Date(startDate);

    while (d <= endDate || currentWeek.length > 0) {
      const dateStr = d.toISOString().slice(0, 10);
      const count = stats.activityMap?.[dateStr] || 0;

      currentWeek.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay()
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      d.setDate(d.getDate() + 1);
      if (d > endDate && currentWeek.length === 0) break;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = [];
    let lastMonth = -1;

    generatedWeeks.forEach((week, wIndex) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({ weekIndex: wIndex, name: monthNames[month] });
        lastMonth = month;
      }
    });

    return { weeks: generatedWeeks, monthLabels: labels };
  }, [stats.activityMap, stats.latestActiveDate]);

  // Get color intensity for cell based on count (LeetCode warm amber tone)
  const getCellColor = (count) => {
    if (count === 0) return "bg-zinc-100 hover:bg-zinc-200 border-zinc-200/70";
    if (count <= 2) return "bg-amber-200 hover:bg-amber-300 border-amber-300";
    if (count <= 5) return "bg-amber-400 hover:bg-amber-500 border-amber-500 text-white";
    if (count <= 8) return "bg-amber-600 hover:bg-amber-700 border-amber-700 text-white";
    return "bg-amber-700 hover:bg-amber-800 border-amber-800 text-white";
  };

  const totalCalculated = stats.easySolved + stats.mediumSolved + stats.hardSolved || stats.totalSolved || 1;
  const easyPct = Math.round((stats.easySolved / totalCalculated) * 100);
  const medPct = Math.round((stats.mediumSolved / totalCalculated) * 100);
  const hardPct = 100 - easyPct - medPct;

  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-300 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-950 p-2.5 text-white shadow-md">
            <LeetCodeLogo className="size-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">LeetCode</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-amber-600"></span>
                </span>
                Top {stats.topPercentage}% Globally
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              Handle: <span className="font-mono text-zinc-950">@{stats.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://leetcode.com/u/${stats.username}/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-amber-700 shadow-sm"
          >
            Visit Profile <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Contest Rating */}
        <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5 transition hover:border-zinc-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Contest Rating</span>
            <Trophy size={16} className="text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700 sm:text-4xl">{stats.rating}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-600">
            Global Rank #{stats.globalRanking?.toLocaleString()}
          </p>
        </div>

        {/* Problems Solved */}
        <div className="rounded-2xl border border-zinc-200 bg-emerald-50/60 p-5 transition hover:border-emerald-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Total Solved</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-800 sm:text-4xl">{stats.totalSolved}+</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-900">Across All Difficulties</p>
        </div>

        {/* Hard Problems Solved */}
        <div className="rounded-2xl border border-zinc-200 bg-rose-50/60 p-5 transition hover:border-rose-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Hard Solved</span>
            <Zap size={16} className="text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-rose-700 sm:text-4xl">{stats.hardSolved}</span>
            <span className="text-xs font-bold text-rose-600">Problems</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-rose-900">Advanced Algorithms</p>
        </div>

        {/* Consistency / Streak */}
        <div className="rounded-2xl border border-zinc-200 bg-orange-50/60 p-5 transition hover:border-orange-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-900">Consistency</span>
            <Flame size={16} className="text-orange-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-orange-800 sm:text-4xl">{stats.activeDays}</span>
            <span className="text-xs font-bold text-orange-700">Days</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-orange-900">Best Streak: {stats.maxStreak} Days</p>
        </div>
      </div>

      {/* Difficulty Breakdown Bar */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-stone-50/70 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Difficulty Distribution</span>
          <span className="text-xs font-semibold text-zinc-500">Total Solved: {stats.totalSolved}</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-zinc-200 gap-0.5">
          <div style={{ width: `${easyPct}%` }} className="bg-teal-500 transition-all duration-500" title={`Easy: ${stats.easySolved}`} />
          <div style={{ width: `${medPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Medium: ${stats.mediumSolved}`} />
          <div style={{ width: `${hardPct}%` }} className="bg-rose-500 transition-all duration-500" title={`Hard: ${stats.hardSolved}`} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-2.5">
            <span className="font-bold text-teal-700">Easy:</span>{" "}
            <span className="font-black text-zinc-950">{stats.easySolved}</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5">
            <span className="font-bold text-amber-700">Medium:</span>{" "}
            <span className="font-black text-zinc-950">{stats.mediumSolved}</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5">
            <span className="font-bold text-rose-700">Hard:</span>{" "}
            <span className="font-black text-zinc-950">{stats.hardSolved}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-stone-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-amber-600" />
              <h4 className="text-base font-bold text-zinc-950 sm:text-lg">LeetCode Activity Heatmap</h4>
            </div>
            <p className="mt-1 text-xs text-zinc-600">
              Daily problem submissions and practice calendar over the past 52 weeks.
            </p>
          </div>

          <div className="min-h-6 flex items-center">
            {hoveredDay ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950 px-3 py-1 text-xs font-medium text-white shadow">
                <span className="font-bold">{hoveredDay.count}</span> submission{hoveredDay.count === 1 ? "" : "s"} on{" "}
                {formatDate(hoveredDay.date)}
              </span>
            ) : (
              <span className="text-xs text-zinc-600 italic">Hover over any cell to view daily activity</span>
            )}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="min-w-[760px] select-none">
            {/* Months Row */}
            <div className="flex text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 pl-7">
              {weeks.map((_, i) => {
                const match = monthLabels.find((m) => m.weekIndex === i);
                return (
                  <div key={i} className="w-3.5 sm:w-4 text-left shrink-0">
                    {match ? match.name : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid with Day Labels */}
            <div className="flex gap-1.5">
              <div className="flex flex-col justify-between py-0.5 text-[10px] font-bold text-zinc-600 w-5 shrink-0 select-none">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Weeks Columns */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                    {week.map((day) => {
                      const colorClass = getCellColor(day.count);
                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`size-3 sm:size-3.5 rounded-[3px] border transition-all duration-150 cursor-pointer ${colorClass} ${
                            hoveredDay?.date === day.date ? "scale-125 z-10 ring-2 ring-zinc-950 shadow-md" : ""
                          }`}
                          aria-label={`${day.count} submissions on ${day.date}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend & Summary Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-950">Active Days:</span> {stats.activeDays} days
                <span className="text-zinc-300">•</span>
                <span className="font-semibold text-zinc-950">Longest Streak:</span> {stats.maxStreak} consecutive days
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-600">Less</span>
                <div className="size-3 rounded-[3px] bg-zinc-100 border border-zinc-200" title="0 submissions" />
                <div className="size-3 rounded-[3px] bg-amber-200 border border-amber-300" title="1-2 submissions" />
                <div className="size-3 rounded-[3px] bg-amber-400 border border-amber-500" title="3-5 submissions" />
                <div className="size-3 rounded-[3px] bg-amber-600 border border-amber-700" title="6-8 submissions" />
                <div className="size-3 rounded-[3px] bg-amber-700 border border-amber-800" title="9+ submissions" />
                <span className="text-[11px] text-zinc-600">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

