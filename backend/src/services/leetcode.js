const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache
let cachedData = null;
let lastFetchedTime = 0;

const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

const USER_QUERY = `
  query getUserData($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        realName
        userAvatar
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submissionCalendar
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
      badge {
        name
      }
    }
  }
`;

export async function getLeetcodeStats(username = "Mayank_2027") {
  const now = Date.now();
  if (cachedData && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: JSON.stringify({
        query: USER_QUERY,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error(`LeetCode GraphQL error with status: ${response.status}`);
    }

    const payload = await response.json();
    const matchedUser = payload.data?.matchedUser;
    const contest = payload.data?.userContestRanking;

    if (!matchedUser) {
      throw new Error("User not found on LeetCode");
    }

    // Solved counts by difficulty
    const solvedCounts = {
      all: 0,
      easy: 0,
      medium: 0,
      hard: 0
    };

    const acStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    for (const item of acStats) {
      const diff = item.difficulty.toLowerCase();
      if (diff === "all") solvedCounts.all = item.count;
      else if (diff === "easy") solvedCounts.easy = item.count;
      else if (diff === "medium") solvedCounts.medium = item.count;
      else if (diff === "hard") solvedCounts.hard = item.count;
    }

    // Parse submission calendar
    const activityMap = {};
    let totalSubmissions = 0;

    if (matchedUser.submissionCalendar) {
      try {
        const cal = JSON.parse(matchedUser.submissionCalendar);
        for (const [timestampStr, count] of Object.entries(cal)) {
          const dateStr = new Date(Number(timestampStr) * 1000).toISOString().slice(0, 10);
          activityMap[dateStr] = (activityMap[dateStr] || 0) + count;
          totalSubmissions += count;
        }
      } catch (parseErr) {
        console.warn("Failed to parse LeetCode submissionCalendar:", parseErr.message);
      }
    }

    // Compute streaks
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

    const rating = contest?.rating ? Math.round(contest.rating) : 1853;
    const topPercentage = contest?.topPercentage || 6.34;
    const globalRanking = contest?.globalRanking || 54695;

    const result = {
      username: matchedUser.username || username,
      realName: matchedUser.profile?.realName || username,
      avatar: matchedUser.profile?.userAvatar,
      profileRanking: matchedUser.profile?.ranking || 216591,
      rating,
      topPercentage,
      globalRanking,
      attendedContests: contest?.attendedContestsCount || 5,
      badge: contest?.badge?.name || "Knight candidate",
      totalSolved: solvedCounts.all || 501,
      easySolved: solvedCounts.easy || 83,
      mediumSolved: solvedCounts.medium || 245,
      hardSolved: solvedCounts.hard || 173,
      totalSubmissions: totalSubmissions || 745,
      activeDays: sortedDates.length || 117,
      maxStreak: maxStreak || 18,
      latestActiveDate: sortedDates[sortedDates.length - 1] || "2026-09-06",
      activityMap,
      lastUpdated: new Date().toISOString()
    };

    cachedData = result;
    lastFetchedTime = now;
    return result;
  } catch (err) {
    console.error("LeetCode fetch error:", err.message);
    if (cachedData) {
      return cachedData;
    }
    return getFallbackStats(username);
  }
}

function getFallbackStats(username) {
  return {
    username,
    realName: username,
    avatar: "https://assets.leetcode.com/users/default_avatar.jpg",
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
    activityMap: {},
    lastUpdated: new Date().toISOString(),
    isFallback: true
  };
}

