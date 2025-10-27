/**
 * StatisticsPage.jsx
 * 
 * Description: Statistics and analytics page showing reading habits and content insights
 * Purpose: Displays data visualizations, reading streaks, and content statistics
 */

import MainLayout from "../components/MainLayout.jsx";

const StatisticsPage = ({ onNavigate }) => {
  const mockArticles = [];
  

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Quick Stats Cards */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Articles</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Articles Read</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Reading Streak</h3>
              <p className="text-3xl font-bold">0 days</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-lg font-semibold mb-4">Analytics Dashboard</h2>
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg mb-4">
                Statistics dashboard coming soon
              </p>
              <p className="text-sm">
                This page will display:
              </p>
              <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
                <li>• Reading activity charts and graphs</li>
                <li>• Content type breakdown (text, video, audio)</li>
                <li>• Top tags and categories</li>
                <li>• Reading time analytics</li>
                <li>• Monthly and yearly trends</li>
                <li>• Goal progress tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatisticsPage;
