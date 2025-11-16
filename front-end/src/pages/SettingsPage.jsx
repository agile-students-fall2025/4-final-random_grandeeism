/**
 * SettingsPage.jsx
 * 
 * Description: Application settings and preferences page
 * Purpose: Allows users to configure app behavior, appearance, and account settings
 */

import { LogOut, Sun, Moon, Monitor, Download, FileDown, ExternalLink, Pencil, Trash } from "lucide-react";
import { useState, useRef } from "react";
import MainLayout from "../components/MainLayout.jsx";
import { Button } from "../components/ui/button.jsx";
import { Switch } from "../components/ui/switch.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select.jsx";
import { Input } from "../components/ui/input.jsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu.jsx";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Checkbox } from "../components/ui/checkbox.jsx";
import { getUserProfile } from "../data/mockUserProfile.js";

const SettingsPage = ({ onNavigate }) => {
  const mockArticles = [];
  const { theme, setTheme } = useTheme();
  const SETTINGS_KEY = 'reader_settings_v1';
  const [fontFamily, setFontFamily] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.fontFamily || 'serif'; } catch { return 'serif'; }
  });
  
  // Profile state - loaded from mock data (will be replaced with backend API call)
  const mockProfile = getUserProfile();
  const [profileData, setProfileData] = useState({
    email: mockProfile.email,
    name: mockProfile.name,
    username: mockProfile.username,
    avatar: mockProfile.avatar
  });
  const initialProfileData = { ...mockProfile }; // Store original values for reset
  // Track the value when user starts editing each field
  const fieldValuesOnFocus = useRef({});

  // Delete account dialog state
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const persistReaderSettings = (next) => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const onFontFamilyChange = (fam) => {
    setFontFamily(fam);
    try {
      const prev = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
      persistReaderSettings({ ...prev, fontFamily: fam });
    } catch {
      persistReaderSettings({ fontFamily: fam });
    }
  };

  // Profile change handlers - update state on change
  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Store the value when user starts editing (on focus)
  const handleProfileFocus = (field) => {
    fieldValuesOnFocus.current[field] = profileData[field];
  };

  // Show toast notification on blur if value actually changed
  const handleProfileBlur = (field) => {
    const fieldLabels = {
      email: "Email",
      name: "Name",
      username: "Username"
    };
    
    // Check if value changed from when user started editing
    const valueOnFocus = fieldValuesOnFocus.current[field];
    const currentValue = profileData[field];
    
    // Only show toast if the value actually changed
    if (valueOnFocus !== undefined && currentValue !== valueOnFocus) {
      toast.success(`${fieldLabels[field]} updated`, {
        // description: `Your ${fieldLabels[field].toLowerCase()} has been changed.`,
      });
    }
  };

  // Reset profile data to initial values
  const handleResetProfile = () => {
    setProfileData({ ...initialProfileData });
    toast.success("Profile reset to original values");
  };

  // Handle avatar change - generate new random image
  const handleChangeAvatar = () => {
    const newAvatar = `https://picsum.photos/200/200?random=${Date.now()}`;
    setProfileData(prev => ({ ...prev, avatar: newAvatar }));
    toast.success("Avatar updated");
  };

  // Handle avatar deletion - reset to original
  const handleDeleteAvatar = () => {
    setProfileData(prev => ({ ...prev, avatar: initialProfileData.avatar }));
    toast.success("Avatar reset to original");
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "auto", label: "Auto", icon: Monitor },
  ];

  const fontOptions = [
    { value: "sans-serif", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "mono", label: "Monospace" },
  ];
  const fontPreviewMap = {
    'serif': "Literata, Georgia, 'Times New Roman', serif",
    'sans-serif': "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    'mono': "'Courier New', Courier, monospace",
  };

  return (
    <MainLayout
      currentPage="settings"
      currentView="Settings"
      onNavigate={onNavigate}
      articles={mockArticles}
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
            <h2 className="text-lg font-semibold mb-4 mt-12">Appearance</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              
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
                <p className="text-xs text-muted-foreground mt-2 mb-4">
                  {theme === "auto" 
                    ? "Theme automatically matches your system preferences" 
                    : `Using ${theme} theme`
                  }
                </p>
                <label className="text-sm font-medium mb-3 block">
                  Reader Font Options
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {fontOptions.map((option) => {
                    const isSelected = fontFamily === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => onFontFamilyChange(option.value)}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                          }
                        `}
                      >
                        <span
                          style={{
                            fontFamily: fontPreviewMap[option.value] || 'inherit',
                            fontSize: '22px',
                            lineHeight: 1,
                          }}
                        >
                          Aa
                        </span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Using {fontFamily} font in the text reader
                </p>
                
              </div>

              {/* Future Settings Placeholder */}
              {/* <div className="pt-4 border-t border-border">
                <div className="text-muted-foreground text-sm">
                  <p className="mb-2">Additional settings coming soon:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Layout density options</li>
                  </ul>
                </div>
              </div> */}
            </div>

            {/* Reading Settings */}
            <h2 className="text-lg font-semibold mb-4 mt-12">Reading</h2>
            <div className="bg-card border border-border rounded-lg px-6">
              {/* <div className="text-muted-foreground">
                <p className="mb-2">Settings will include:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Default view mode (Article/Reader)</li>
                  <li>• Auto-archive after reading</li>
                  <li>• Daily reading goal</li>
                  <li>• Reader font and width preferences</li>
                </ul>
              </div> */}
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="reader-mode" className="font-medium select-none">Reader Mode</label>
                  <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p>
                </div>
                <div>
                  <Switch defaultChecked id="reader-mode"/>
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="images-mode" className="font-medium select-none">Show Images</label>
                  <p className="text-sm text-muted-foreground mt-1">Display images in the reader.</p>
                </div>
                <div>
                  <Switch defaultChecked id="images-mode" />
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="reading-time" className="font-medium select-none">Estimated Reading Time</label>
                  <p className="text-sm text-muted-foreground mt-1">Show reading time estimate on cards.</p>
                </div>
                <div>
                  <Switch defaultChecked id="reading-time" />
                </div>
              </div>
              <div className="py-4 border-border flex items-center justify-between">
                <div>
                  <label htmlFor="auto-archive" className="font-medium select-none">Auto-archive after reading</label>
                  <p className="text-sm text-muted-foreground mt-1">Automatically archive articles after reading.</p>
                </div>
                <div>
                  <Switch defaultChecked id="auto-archive" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <h2 className="text-lg font-semibold mb-4 mt-12">Notifications</h2>
            <div className="bg-card border border-border rounded-lg px-6">
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="reading-reminders" className="font-medium select-none">Daily Reading Reminders</label>
                  <p className="text-sm text-muted-foreground mt-0">Receive daily reminders to read.</p>
                </div>
                <div>
                  <Switch id="reading-reminders" />
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="new-content-notifications" className="font-medium select-none">New Content Notifications</label>
                  <p className="text-sm text-muted-foreground mt-0">Receive notifications for new articles, notes, and highlights.</p>
                </div>
                <div>
                  <Switch id="new-content-notifications" />
                </div>
              </div>
              <div className="py-4 border-border border-b flex items-center justify-between">
                <div>
                  <label htmlFor="preferences" className="font-medium select-none">Email Digest Preferences</label>
                  <p className="text-sm text-muted-foreground mt-0">Choose how often you want to receive email digests.</p>
                </div>
                <div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue value="weekly" placeholder="Weekly"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly" checked>Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="py-4 border-border flex items-center justify-between">
                <div>
                  <label htmlFor="marketing-notifications" className="font-medium select-none">Marketing Emails</label>
                  <p className="text-sm text-muted-foreground mt-0">Receive emails about new products, features, and more.</p>
                </div>
                <div>
                  <Switch id="marketing-notifications" />
                </div>
              </div>
            </div>

            {/* Export & Integrations */}
            <h2 className="text-lg font-semibold mb-4 mt-12">Export & Integrations</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              
              {/* PKM Integrations */}
              {/* <div className="mb-6">
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
              </div> */}

              {/* Export Options */}
              <div className="">
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
            <h2 className="text-lg font-semibold mb-4 mt-12">Account</h2>
            <div className="bg-card border border-border rounded-lg px-6">
              {/* <div className="text-muted-foreground"> */}
                {/* <p className="mb-2">Settings will include:</p> */}
                {/* <ul className="space-y-1 ml-4"> */}
                  {/* <li>• Profile information</li> */}
                  {/* <li>• Email and password management</li> */}
                  {/* <li>• Connected services and integrations</li> */}
                  {/* <li>• Data export and import options</li> */}
                  {/* <li>• Account deletion</li> */}
                {/* </ul> */}
              {/* </div> */}
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label className="font-medium select-none">Profile Picture</label>
                  {/* <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p> */}
                </div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="size-8 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={profileData.avatar} alt={profileData.username || "@username"}/>
                        <AvatarFallback>
                          {profileData.name 
                            ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : profileData.username 
                            ? profileData.username.slice(0, 2).toUpperCase()
                            : 'CN'}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleChangeAvatar}><Pencil size={16} className="mr-2" /> Change Avatar</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeleteAvatar}><Trash size={16} className="mr-2" /> Delete Avatar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="email" className="font-medium select-none">Email</label>
                  {/* <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p> */}
                </div>
                <div>
                  <Input 
                    type="email" 
                    id="email" 
                    value={profileData.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    onFocus={() => handleProfileFocus('email')}
                    onBlur={() => handleProfileBlur('email')}
                  />
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="name" className="font-medium select-none">Name</label>
                  {/* <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p> */}
                </div>
                <div>
                  <Input 
                    id="name" 
                    value={profileData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                    onFocus={() => handleProfileFocus('name')}
                    onBlur={() => handleProfileBlur('name')}
                  />
                </div>
              </div>
              <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                  <label htmlFor="username" className="font-medium select-none">Username</label>
                  {/* <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p> */}
                </div>
                <div>
                  <Input 
                    id="username" 
                    value={profileData.username}
                    onChange={(e) => handleProfileInputChange('username', e.target.value)}
                    onFocus={() => handleProfileFocus('username')}
                    onBlur={() => handleProfileBlur('username')}
                  />
                </div>
              </div>
              
              {/* Sign Out Button */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <label htmlFor="sign-out" className="font-medium select-none">Sign Out</label>
                  {/* <p className="text-sm text-muted-foreground mt-1">Clean, distraction-free reading experience.</p> */}
                </div>
                <div>
                  <Button 
                  // variant="destructive" 
                  onClick={() => onNavigate('landing')}
                  className="w-full sm:w-auto"
                >
                  <LogOut size={16} className="mr-2" />
                  Log Out
                </Button>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-4 mt-12">Danger Zone</h2>
          <div className="bg-card border border-border rounded-lg px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium select-none">Delete Account</label>
                <p className="text-sm text-muted-foreground mt-1">Warning: This action is irreversible.</p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      // onClick={() => onNavigate('auth')}
                      className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Your Account</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        <p className="mb-3 mt-4">Are you sure you want to delete your account? </p>
                        <p className="mb-3">This action is irreversible.</p>
                        <p className="">All data including but not limited to articles, notes, highlights, and reading progress will be permanently deleted.</p>
                    </DialogDescription>
                    <label htmlFor="delete-email"className="text-sm text-foreground mt-1">Enter your account email to confirm deletion:</label>
                    <Input type="email" id="delete-email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} />
                    <div className="flex items-center gap-4 mt-2">
                      <Checkbox id="confirm" checked={deleteConfirm} onCheckedChange={setDeleteConfirm} />
                      <label htmlFor="confirm" className="text-sm text-muted-foreground">I understand that this action is irreversible and will permanently delete my account and all associated data.</label>
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose>
                        <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        variant="destructive" 
                        disabled={deleteEmail !== profileData.email || !deleteConfirm} 
                        onClick={() => onNavigate('auth')}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
