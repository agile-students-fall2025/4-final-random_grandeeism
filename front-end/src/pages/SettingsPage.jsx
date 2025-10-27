/**
 * SettingsPage.jsx
 * 
 * Description: Application settings and preferences page
 * Purpose: Allows users to configure app behavior, appearance, and account settings
 */

import { LogOut, Sun, Moon, Monitor, Download, FileDown, ExternalLink } from "lucide-react";
import MainLayout from "../components/MainLayout.jsx";
import { Button } from "../components/ui/button.jsx";
import { useTheme } from "../hooks/useTheme.js";

const SettingsPage = ({ onNavigate }) => {
  const mockArticles = [];
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "auto", label: "Auto", icon: Monitor },
  ];

  return (
    <MainLayout
      currentPage="settings"
      currentView="Settings"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Settings"
      showSearch={false}
    >
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your preferences and account settings
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Appearance Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              
              {/* Theme Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                          }
                        `}
                      >
                        <Icon size={24} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {theme === "auto" 
                    ? "Theme automatically matches your system preferences" 
                    : `Using ${theme} theme`
                  }
                </p>
              </div>

              {/* Future Settings Placeholder */}
              <div className="pt-4 border-t border-border">
                <div className="text-muted-foreground text-sm">
                  <p className="mb-2">Additional settings coming soon:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Font size and reading preferences</li>
                    <li>• Layout density options</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reading Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Reading</h2>
              <div className="text-muted-foreground">
                <p className="mb-2">Settings will include:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Default view mode (Article/Reader)</li>
                  <li>• Auto-archive after reading</li>
                  <li>• Daily reading goal</li>
                  <li>• Reader font and width preferences</li>
                </ul>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="text-muted-foreground">
                <p className="mb-2">Settings will include:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Daily reading reminders</li>
                  <li>• New content notifications</li>
                  <li>• Email digest preferences</li>
                </ul>
              </div>
            </div>

            {/* Export & Integrations */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Export & Integrations</h2>
              
              {/* PKM Integrations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">PKM Integrations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect fieldnotes. with your personal knowledge management tools to sync notes and highlights.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <ExternalLink size={20} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Obsidian</div>
                        <div className="text-xs text-muted-foreground">Export notes and highlights to Obsidian vault</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <ExternalLink size={20} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Notion</div>
                        <div className="text-xs text-muted-foreground">Sync articles and notes to Notion database</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <ExternalLink size={20} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Zotero</div>
                        <div className="text-xs text-muted-foreground">Export citations and research notes to Zotero library</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  </button>
                </div>
              </div>

              {/* Export Options */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download your data in various formats for backup or migration.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => console.log('Export notes')}
                  >
                    <FileDown size={16} className="mr-2" />
                    Export Notes & Highlights
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto ml-0 sm:ml-2"
                    onClick={() => console.log('Export all data')}
                  >
                    <Download size={16} className="mr-2" />
                    Export All My Data
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Exports include all articles, tags, notes, highlights, and reading progress in JSON format.
                </p>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Account</h2>
              <div className="text-muted-foreground">
                <p className="mb-2">Settings will include:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Profile information</li>
                  <li>• Email and password management</li>
                  <li>• Connected services and integrations</li>
                  <li>• Data export and import options</li>
                  <li>• Account deletion</li>
                </ul>
              </div>
              
              {/* Sign Out Button */}
              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  variant="destructive" 
                  onClick={() => onNavigate('auth')}
                  className="w-full sm:w-auto"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
