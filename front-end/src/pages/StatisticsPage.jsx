/**
 * StatisticsPage.jsx
 * 
 * Description: Statistics and analytics page showing reading habits and content insights
 * Purpose: Displays data visualizations, reading streaks, and content statistics
 */

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import { STATUS } from "../constants/statuses.js";
import { articlesAPI, usersAPI } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const StatisticsPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);

  const normalizeArticles = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data) return response.data;
    if (response?.articles) return response.articles;
    return [];
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setError("");
        setLoading(true);
        const [articleRes, statsRes] = await Promise.all([
          articlesAPI.getAll(),
          usersAPI.getStats(user.id),
        ]);

        if (!isMounted) return;
        setArticles(normalizeArticles(articleRes));
        setStats(statsRes?.data || statsRes || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load statistics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const derived = useMemo(() => {
    const savedCount = articles.length;
    const startedStatuses = new Set([
      STATUS.DAILY,
      STATUS.CONTINUE,
      STATUS.REDISCOVERY,
      STATUS.ARCHIVED,
    ]);
    const startedCount = articles.filter((a) => {
      const status = (a.status || "").toLowerCase();
      const progress = Number(a.progress || 0);
      return startedStatuses.has(status) || progress > 0;
    }).length;
    const completedCount = articles.filter((a) => {
      const status = (a.status || "").toLowerCase();
      const progress = Number(a.progress || 0);
      return status === STATUS.ARCHIVED || progress === 100;
    }).length;

    return {
      savedCount,
      startedCount,
      completedCount,
    };
  }, [articles]);

  return (
    <MainLayout
      currentPage="statistics"
      currentView="Statistics"
      onNavigate={onNavigate}
      articles={articles}
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

          {error && (
            <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Articles Saved</h3>
              <p className="text-3xl font-bold">{loading ? "--" : derived.savedCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Started Reading</h3>
              <p className="text-3xl font-bold">{loading ? "--" : derived.startedCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed / Archived</h3>
              <p className="text-3xl font-bold">{loading ? "--" : derived.completedCount}</p>
            </div>
          </div>

          {/* <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-lg font-semibold mb-2">Reading Activity Heatmap</h2>
            <p className="text-sm text-muted-foreground">Temporarily disabled while streak data is finalized.</p>
          </div> */}
        </div>
      </div>
    </MainLayout>
  );
};

export default StatisticsPage;
