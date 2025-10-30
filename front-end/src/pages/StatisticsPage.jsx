/**
 * StatisticsPage.jsx
 * 
 * Description: Statistics and analytics page showing reading habits and content insights
 * Purpose: Displays data visualizations, reading streaks, and content statistics
 */

import MainLayout from "../components/MainLayout.jsx";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip.jsx";

const StatisticsPage = ({ onNavigate }) => {
  const mockArticles = [];

  // Generate mock reading minutes for the last 365 days
  const days = 365;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (days - 1));

  // Align grid to full weeks (Sun-Sat)
  const startOfGrid = new Date(startDate);
  const startDow = startOfGrid.getDay(); // 0=Sun
  startOfGrid.setDate(startOfGrid.getDate() - startDow);

  const endOfGrid = new Date(endDate);
  const endDow = endOfGrid.getDay();
  endOfGrid.setDate(endOfGrid.getDate() + (6 - endDow));

  const allDays = [];
  for (let d = new Date(startOfGrid); d <= endOfGrid; d.setDate(d.getDate() + 1)) {
    const current = new Date(d);
    let minutes = null;
    if (current >= startDate && current <= endDate) {
      // skewed random: more zeros, some medium, few high
      const r = Math.random();
      minutes = r < 0.5 ? 0 : r < 0.85 ? Math.floor(Math.random() * 25) + 5 : Math.floor(Math.random() * 60) + 30;
    }
    allDays.push({ date: current, minutes });
  }

  // Group into weeks (columns) of 7 days (rows)
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const getIntensityClass = (minutes) => {
    if (minutes == null) return "bg-muted/20";
    if (minutes === 0) return "bg-muted/40";
    if (minutes <= 10) return "bg-indigo-200";
    if (minutes <= 25) return "bg-indigo-300";
    if (minutes <= 45) return "bg-indigo-400";
    return "bg-indigo-500";
  };

  // Compute stats from generated data
  const realDays = allDays.filter((d) => d.minutes != null);
  const totalMinutes = realDays.reduce((sum, d) => sum + (d.minutes || 0), 0);
  const daysRead = realDays.filter((d) => (d.minutes || 0) > 0).length;
  const percentDaysRead = Math.round((daysRead / days) * 100);
  // Longest reading streak (consecutive days with minutes > 0)
  let longestStreak = 0;
  let currentStreak = 0;
  for (const d of realDays) {
    if ((d.minutes || 0) > 0) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  // Current streak up to today (walk from end backward)
  let ongoingStreak = 0;
  for (let i = realDays.length - 1; i >= 0; i -= 1) {
    if ((realDays[i].minutes || 0) > 0) ongoingStreak += 1;
    else break;
  }
  // Approximate number of articles read assuming ~20 minutes per article
  const articlesRead = Math.max(0, Math.round(totalMinutes / 20));
  const totalArticles = Math.max(articlesRead, Math.round(articlesRead * 1.3));
  

  return (
    <MainLayout
      currentPage="statistics"
      currentView="Statistics"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Statistics"
      showSearch={false}
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Statistics</h1>
            <p className="text-muted-foreground">
              Your reading habits and content insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Quick Stats Cards */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Articles</h3>
              <p className="text-3xl font-bold">{totalArticles}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Articles Read</h3>
              <p className="text-3xl font-bold">{articlesRead}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Longest Reading Streak</h3>
              <p className="text-3xl font-bold">{longestStreak} days</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Days Read</h3>
              <p className="text-3xl font-bold">{percentDaysRead}%</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Streak</h3>
              <p className="text-3xl font-bold">{ongoingStreak} days</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-lg font-semibold mb-6">Reading Activity Heatmap</h2>
            <div className="overflow-x-auto">
              <div className="flex items-start gap-2">
                {/* Weekday labels column (Sun-Sat) showing M, W, F */}
                <div className="flex flex-col gap-1 mr-2 text-[10px] text-muted-foreground select-none">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="h-3.5 flex items-center justify-end pr-1">
                      {idx === 1 ? "M" : idx === 3 ? "W" : idx === 5 ? "F" : ""}
                    </div>
                  ))}
                </div>
                {/* Week columns */}
                <div className="flex items-start gap-2">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => (
                        day.minutes == null ? (
                          <div
                            key={`${wIdx}-${dIdx}-pad`}
                            className="size-3.5 rounded-xs bg-muted/20 border border-transparent"
                            aria-hidden
                          />
                        ) : (
                          <Tooltip key={`${wIdx}-${dIdx}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`size-3.5 rounded-xs ${getIntensityClass(day.minutes)} border border-border/50 hover:opacity-90`}
                                aria-label={`${day.date.toLocaleDateString()} • ${day.minutes} min`}
                                title=""
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex flex-col">
                                <span className="font-medium">{day.date.toLocaleDateString()}</span>
                                <span className="opacity-90">{day.minutes} min read</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {/* Month labels row */}
              <div className="mt-2 flex">
                <div className="w-6" />
                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  {weeks.map((week, wIdx) => {
                    const firstDay = week[0]?.date;
                    const prevFirstDay = weeks[wIdx - 1]?.[0]?.date;
                    const showLabel =
                      wIdx === 0 || (prevFirstDay && firstDay.getMonth() !== prevFirstDay.getMonth());
                    const label = showLabel ? firstDay.toLocaleString(undefined, { month: "short" }) : "";
                    return (
                      <div key={`m-${wIdx}`} className="w-3.5">
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="h-3 w-3 rounded-xs bg-muted/40 border border-border/50" />
              <div className="h-3 w-3 rounded-xs bg-indigo-200" />
              <div className="h-3 w-3 rounded-xs bg-indigo-300" />
              <div className="h-3 w-3 rounded-xs bg-indigo-400" />
              <div className="h-3 w-3 rounded-xs bg-indigo-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatisticsPage;
