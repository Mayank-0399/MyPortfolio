const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache
let cachedData = null;
let lastFetchedTime = 0;

export async function getCodeforcesStats(handle = "mayanksingh230651") {
  const now = Date.now();
  if (cachedData && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const [userRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
      fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`)
    ]);

    if (!userRes.ok || !statusRes.ok) {
      throw new Error(`Codeforces API returned error status: ${userRes.status} / ${statusRes.status}`);
    }

    const userData = await userRes.json();
    const statusData = await statusRes.json();

    if (userData.status !== "OK" || !userData.result?.[0]) {
      throw new Error("Invalid user.info response from Codeforces");
    }

    const user = userData.result[0];
    const submissions = statusData.result || [];

    const solvedSet = new Set();
    const activityMap = {};
    const tagsMap = {};
    const ratingsMap = {};

    for (const s of submissions) {
      const dateStr = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;

      if (s.verdict === "OK" && s.problem) {
        const pId = `${s.problem.contestId || "C"}-${s.problem.index}`;
        if (!solvedSet.has(pId)) {
          solvedSet.add(pId);
          if (s.problem.rating) {
            ratingsMap[s.problem.rating] = (ratingsMap[s.problem.rating] || 0) + 1;
          }
          if (Array.isArray(s.problem.tags)) {
            s.problem.tags.forEach((tag) => {
              tagsMap[tag] = (tagsMap[tag] || 0) + 1;
            });
          }
        }
      }
    }

    const sortedDates = Object.keys(activityMap).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      if (!prevDate) {
        currentStreak = 1;
      } else {
        const prev = new Date(prevDate);
        const curr = new Date(dateStr);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      prevDate = dateStr;
    }

    const topTags = Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    const ratingDistribution = Object.entries(ratingsMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([rating, count]) => ({ rating: Number(rating), count }));

    const result = {
      handle: user.handle,
      rating: user.rating || 0,
      rank: user.rank || "unranked",
      maxRating: user.maxRating || user.rating || 0,
      maxRank: user.maxRank || user.rank || "unranked",
      avatar: user.avatar,
      titlePhoto: user.titlePhoto,
      uniqueSolved: solvedSet.size,
      totalSubmissions: submissions.length,
      activeDays: sortedDates.length,
      maxStreak,
      latestActiveDate: sortedDates[sortedDates.length - 1] || null,
      activityMap,
      topTags,
      ratingDistribution,
      lastUpdated: new Date().toISOString()
    };

    cachedData = result;
    lastFetchedTime = now;
    return result;
  } catch (error) {
    console.error("Codeforces API fetch error:", error.message);
    if (cachedData) {
      return cachedData;
    }
    // Return baseline fallback data so portfolio always renders
    return getFallbackStats(handle);
  }
}

function getFallbackStats(handle) {
  return {
    handle,
    rating: 1453,
    rank: "specialist",
    maxRating: 1453,
    maxRank: "specialist",
    uniqueSolved: 705,
    totalSubmissions: 1325,
    activeDays: 281,
    maxStreak: 34,
    latestActiveDate: "2026-09-06",
    activityMap: {},
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
    ratingDistribution: [],
    lastUpdated: new Date().toISOString(),
    isFallback: true
  };
}

