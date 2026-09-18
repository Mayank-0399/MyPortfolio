import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Award, Calendar, CheckCircle2, Flame, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Pre-computed fallback snapshot for instant rendering and offline resilience
const FALLBACK_STATS = {
  handle: "mayanksingh230651",
  rating: 1453,
  rank: "specialist",
  maxRating: 1453,
  maxRank: "specialist",
  uniqueSolved: 705,
  totalSubmissions: 1325,
  activeDays: 281,
  maxStreak: 34,
  latestActiveDate: "2026-09-06",
  topTags: [
    { tag: "greedy", count: 396 },
    { tag: "math", count: 308 },
    { tag: "constructive algorithms", count: 167 },
    { tag: "implementation", count: 162 },
    { tag: "dp", count: 146 },
    { tag: "brute force", count: 145 },
    { tag: "data structures", count: 120 },
    { tag: "binary search", count: 85 }
  ],
  activityMap: {}
};

// Formats a date string (YYYY-MM-DD) into readable text e.g. "Sep 5, 2026"
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

// Codeforces SVG icon
function CodeforcesLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="1.5" y="9" width="5" height="12" rx="1.5" fill="#FFD400" />
      <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill="#1874D0" />
      <rect x="17.5" y="6" width="5" height="15" rx="1.5" fill="#E91E63" />
    </svg>
  );
}

export default function CodeforcesWidget() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        // 1. Try fetching from backend proxy endpoint
        const res = await fetch(`${apiUrl}/api/codeforces?handle=mayanksingh230651`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.rating) {
            setStats(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to direct Codeforces API...", err.message);
      }

      // 2. Direct fallback to Codeforces public API
      try {
        const [userRes, statusRes] = await Promise.all([
          fetch("https://codeforces.com/api/user.info?handles=mayanksingh230651"),
          fetch("https://codeforces.com/api/user.status?handle=mayanksingh230651")
        ]);

        if (userRes.ok && statusRes.ok) {
          const userData = await userRes.json();
          const statusData = await statusRes.json();

          if (userData.status === "OK" && userData.result?.[0]) {
            const user = userData.result[0];
            const submissions = statusData.result || [];
            const solvedSet = new Set();
            const actMap = {};
            const tagMap = {};

            for (const s of submissions) {
              const d = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
              actMap[d] = (actMap[d] || 0) + 1;
              if (s.verdict === "OK" && s.problem) {
                const pId = `${s.problem.contestId || "C"}-${s.problem.index}`;
                if (!solvedSet.has(pId)) {
                  solvedSet.add(pId);
                  if (Array.isArray(s.problem.tags)) {
                    s.problem.tags.forEach((t) => {
                      tagMap[t] = (tagMap[t] || 0) + 1;
                    });
                  }
                }
              }
            }

            const sortedDates = Object.keys(actMap).sort();
            let maxStreak = 0;
            let curStreak = 0;
            let prevDate = null;
            for (const d of sortedDates) {
              if (!prevDate) {
                curStreak = 1;
              } else {
                const diff = Math.round((new Date(d) - new Date(prevDate)) / 86400000);
                if (diff === 1) curStreak++;
                else if (diff > 1) curStreak = 1;
              }
              if (curStreak > maxStreak) maxStreak = curStreak;
              prevDate = d;
            }

            const topTags = Object.entries(tagMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([tag, count]) => ({ tag, count }));

            if (isMounted) {
              setStats({
                handle: user.handle,
                rating: user.rating || 1453,
                rank: user.rank || "specialist",
                maxRating: user.maxRating || 1453,
                maxRank: user.maxRank || "specialist",
                uniqueSolved: solvedSet.size || 705,
                totalSubmissions: submissions.length || 1325,
                activeDays: sortedDates.length || 281,
                maxStreak: maxStreak || 34,
                latestActiveDate: sortedDates[sortedDates.length - 1] || "2026-09-06",
                topTags: topTags.length ? topTags : FALLBACK_STATS.topTags,
                activityMap: actMap
              });
              setLoading(false);
              return;
            }
          }
        }
      } catch (directErr) {
        console.warn("Direct Codeforces API also failed, using fallback data:", directErr.message);
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
    // Reference date: latest active date or current date
    const refDate = stats.latestActiveDate ? new Date(stats.latestActiveDate) : new Date();
    // Anchor to today if reference date is in the past
    const now = new Date();
    const endDate = refDate > now ? refDate : now;

    // 52 weeks back
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 52 * 7);
    // Align to Sunday
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

    // Month headers
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

  // Get color intensity for cell based on count
  const getCellColor = (count) => {
    if (count === 0) return "bg-zinc-100 hover:bg-zinc-200 border-zinc-200/70";
    if (count <= 2) return "bg-emerald-200 hover:bg-emerald-300 border-emerald-300";
    if (count <= 5) return "bg-emerald-400 hover:bg-emerald-500 border-emerald-500 text-white";
    if (count <= 8) return "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white";
    return "bg-emerald-800 hover:bg-emerald-900 border-emerald-900 text-white";
  };

  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-300 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-950 p-2 text-white shadow-md">
            <CodeforcesLogo className="size-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Codeforces</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-cyan-600"></span>
                </span>
                {stats.rank}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              Handle: <span className="font-mono text-zinc-950">@{stats.handle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://codeforces.com/profile/${stats.handle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 shadow-sm"
          >
            Visit Profile <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Rating */}
        <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5 transition hover:border-zinc-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Rating</span>
            <Trophy size={16} className="text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-700 sm:text-4xl">{stats.rating}</span>
            <span className="text-xs font-bold text-zinc-600">Max: {stats.maxRating}</span>
          </div>
          <p className="mt-1 text-xs font-semibold capitalize text-zinc-600">{stats.rank}</p>
        </div>

        {/* Problems Solved */}
        <div className="rounded-2xl border border-zinc-200 bg-emerald-50/60 p-5 transition hover:border-emerald-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Solved</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-800 sm:text-4xl">{stats.uniqueSolved}+</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-900">Unique Problems</p>
        </div>

        {/* Submissions */}
        <div className="rounded-2xl border border-zinc-200 bg-stone-50 p-5 transition hover:border-zinc-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Submissions</span>
            <Activity size={16} className="text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-zinc-950 sm:text-4xl">
              {stats.totalSubmissions ? stats.totalSubmissions.toLocaleString() : "1,325+"}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-600">Total Attempts</p>
        </div>

        {/* Consistency / Streak */}
        <div className="rounded-2xl border border-zinc-200 bg-orange-50/60 p-5 transition hover:border-orange-300 hover:shadow-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-900">Streak</span>
            <Flame size={16} className="text-orange-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-orange-800 sm:text-4xl">{stats.maxStreak}</span>
            <span className="text-xs font-bold text-orange-700">Days</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-orange-900">{stats.activeDays} Active Days</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-stone-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-700" />
              <h4 className="text-base font-bold text-zinc-950 sm:text-lg">Activity & Submissions Heatmap</h4>
            </div>
            <p className="mt-1 text-xs text-zinc-600">
              Daily problem solving frequency and contest participation over the past 52 weeks.
            </p>
          </div>

          {/* Hover detail indicator */}
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

        {/* Heatmap Grid Container (Horizontally scrollable for responsiveness) */}
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
              {/* Day of Week Labels (Mon, Wed, Fri) */}
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
                <div className="size-3 rounded-[3px] bg-emerald-200 border border-emerald-300" title="1-2 submissions" />
                <div className="size-3 rounded-[3px] bg-emerald-400 border border-emerald-500" title="3-5 submissions" />
                <div className="size-3 rounded-[3px] bg-emerald-600 border border-emerald-700" title="6-8 submissions" />
                <div className="size-3 rounded-[3px] bg-emerald-800 border border-emerald-900" title="9+ submissions" />
                <span className="text-[11px] text-zinc-600">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Topic Tags */}
      {stats.topTags && stats.topTags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">
            Top Categories Solved:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.topTags.map(({ tag, count }) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-white"
              >
                <span className="capitalize">{tag}</span>
                <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

