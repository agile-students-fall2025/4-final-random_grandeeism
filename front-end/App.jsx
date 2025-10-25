import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Inbox as InboxIcon, 
  BookOpen, 
  BookMarked, 
  Sparkles, 
  Video, 
  Headphones, 
  FileText, 
  Tag, 
  Rss, 
  BarChart3, 
  Settings as SettingsIcon 
} from 'lucide-react';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import DailyReading from './pages/DailyReading';
import ContinueReading from './pages/ContinueReading';
import Rediscovery from './pages/Rediscovery';
import Videos from './pages/Videos';
import Audios from './pages/Audios';
import Text from './pages/Text';
import Tags from './pages/Tags';
import Feeds from './pages/Feeds';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul>
            <li><Link to="/"><HomeIcon size={18} /> Home</Link></li>
            <li><Link to="/inbox"><InboxIcon size={18} /> Inbox</Link></li>
            <li><Link to="/daily-reading"><BookOpen size={18} /> Daily Reading</Link></li>
            <li><Link to="/continue-reading"><BookMarked size={18} /> Continue Reading</Link></li>
            <li><Link to="/rediscovery"><Sparkles size={18} /> Rediscovery</Link></li>
            <li><Link to="/videos"><Video size={18} /> Videos</Link></li>
            <li><Link to="/audios"><Headphones size={18} /> Audios</Link></li>
            <li><Link to="/text"><FileText size={18} /> Text</Link></li>
            <li><Link to="/tags"><Tag size={18} /> Tags</Link></li>
            <li><Link to="/feeds"><Rss size={18} /> Feeds</Link></li>
            <li><Link to="/statistics"><BarChart3 size={18} /> Statistics</Link></li>
            <li><Link to="/settings"><SettingsIcon size={18} /> Settings</Link></li>
          </ul>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/daily-reading" element={<DailyReading />} />
          <Route path="/continue-reading" element={<ContinueReading />} />
          <Route path="/rediscovery" element={<Rediscovery />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/audios" element={<Audios />} />
          <Route path="/text" element={<Text />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
