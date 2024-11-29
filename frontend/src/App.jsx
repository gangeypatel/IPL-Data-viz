import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css'
import Upload from './Components/Upload';
import View from './Components/View';
import { useLocation } from 'react-router-dom';

const DataPage = () => {
  const location = useLocation();
  const data = location.state?.data || [];
  
  if (!data.length) return <div>No Data Found!</div>;

  return <View data={data} />;
};

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Upload/>}/>
        <Route path="/data" element={<DataPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
