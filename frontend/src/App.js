import logo from './logo.svg';
import './App.css';
import Stories from './stories/stories';
import StoryView from './stories/storiesview';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Stories />} />
          {/* <Route path="/story/:storyId" element={<StoryView />} /> */}
          {/* <Route path="/story/:storyId" element={<StoryView />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
