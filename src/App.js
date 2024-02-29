// App.js
import React, { useState } from 'react';
import UOSLogo from './components/images/uosMark.png';
import Map from './components/MapC';
import ThreeDContent from './components/ThreeDContent';
import fullKLogo from './components/images/fullKLogo.png';
import SLogo from './components/images/SLogo.png';
import './App.css'; // App.css 파일을 import

// FindPathContent.js
import legend from './components/images/legend.png';
import axios from 'axios';
//

const Header = ({ searchTerm, setSearchTerm, handleSearch, activeTab, handleTabChange }) => {
    return (
        <header className='header'>
            <img src={fullKLogo} alt="SㅣnerGY FLogo" style={{width: '200px',display: 'block',margin: '0 auto'}} />
            <div className="search-bar">
                <img src={SLogo} alt="SㅣnerGY SLogo" style={{padding:'2px', width:'19px'}}/>
                <input type="text"
                   placeholder="검색어를 입력하세요"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{margin: '0 Auto'}}/>
                <button onClick={handleSearch}>검색</button>
            </div>
        </header>
    );
}

//길찾기//
const usePathfinding = () => {
  const initialFeaturesState = {
    unpaved: false,
    stairs: false,
    slope: false,
    bump: false,
    bol: false,
  };
  const [features, setFeatures] = useState(initialFeaturesState);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stopovers, setStopovers] = useState([]);
  const [showShortestPathText, setShowShortestPathText] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [pathData, setPathData] = useState(null);

  const handlePathResult = (data) => {
    console.log(data.minAggCost);
    const calculatedTotalDistance = data.minAggCost;
    setTotalDistance(calculatedTotalDistance);
    setShowShortestPathText(true);
    const shortestPath = data.shortestPath;
    if (shortestPath) {
      setPathData(shortestPath);
    }
  };

  const handleFindPathClick = async () => {
    try {
      const requestData = {
        start,
        end,
        stopovers,
        features,
      };
      console.log('중간점검용:', requestData);
      try {
        var response = await axios.post('http://localhost:5000/findPathServer', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        handlePathResult(response.data);
      } catch (error) {
        console.error('Error during Axios POST request', error);
      }
    } catch (error) {
      console.error('Error finding path:', error);
    }
  };

  const addStopover = () => {
    setStopovers([...stopovers, '']);
  };

  const handleStopoverChange = (index, value) => {
    const updatedStopovers = [...stopovers];
    updatedStopovers[index] = value;
    setStopovers(updatedStopovers);
  };

  const handleInputReset = () => {
    setFeatures(initialFeaturesState);
    setStart('');
    setEnd('');
    setStopovers([]);
    setShowShortestPathText(false);
    setTotalDistance(0);
    setPathData(null);
  };

  return {
    features,
    start,
    end,
    stopovers,
    showShortestPathText,
    totalDistance,
    pathData,
    setFeatures,
    setStart,
    setEnd,
    setStopovers,
    setShowShortestPathText,
    setTotalDistance,
    setPathData,
    handleFindPathClick,
    addStopover,
    handleStopoverChange,
    handleInputReset,
  };
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    //길찾기
    const {
      features,
      start,
      end,
      stopovers,
      showShortestPathText,
      totalDistance,
      pathData,
      setFeatures,
      setStart,
      setEnd,
      setStopovers,
      setShowShortestPathText,
      setTotalDistance,
      setPathData,
      handleFindPathClick,
      addStopover,
      handleStopoverChange,
      handleInputReset,
    } = usePathfinding();
  
    const toggleFeature = (feature) => {
      setFeatures({ ...features, [feature]: !features[feature] });
    };

    return (
        <div className='container' >
            <div className="main-left-side">
                <Header handleSearch={() => {
                    setKeyword(searchTerm);
                }} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <div className='menu'>
                  <button onClick={() => handleTabChange('')} className={`menu-tab ${activeTab === '' ? 'active' : ''}`}>home</button>
                  <button onClick={() => handleTabChange('길찾기')} className={`menu-tab ${activeTab === '길찾기' ? 'active' : ''}`}>길찾기</button>
                  <button onClick={() => handleTabChange('3D')} className={`menu-tab ${activeTab === '3D' ? 'active' : ''}`}>3D</button>
                </div>
                {activeTab === '' && <div className='home-left'>
                    <a href="https://www.uos.ac.kr/main.do?epTicket=INV">
                        <img src={UOSLogo} alt="UOS Logo for link" style={{ width: '160px', margin: '0 auto' }} />
                    </a>
                </div>}
                {activeTab === '길찾기' && (
                <div>
                  <div className="pathfinder-page">
                    <div className="option-button-row">
                      <button className={`option-button ${features.unpaved ? 'selected-button' : ''}`} style={{ marginLeft: '5px' }} onClick={() => toggleFeature('unpaved')} >비포장도로 제외</button>
                      <button className={`option-button ${features.stairs ? 'selected-button' : ''}`} onClick={() => toggleFeature('stairs')}>계단 제외</button>
                      <button className={`option-button ${features.slope ? 'selected-button' : ''}`} onClick={() => toggleFeature('slope')}>경사로 제외</button>
                      <button className={`option-button ${features.bump ? 'selected-button' : ''}`} onClick={() => toggleFeature('bump')}>도로턱 제외</button>
                      <button className={`option-button ${features.bol ? 'selected-button' : ''}`} style={{ marginRight: '5px' }} onClick={() => toggleFeature('bol')} >볼라드 제외</button>
                    </div>
                    <div className="input-row">
                        <input className='pf-input-style' type="text" placeholder="출발지를 입력하세요" value={start} onChange={(e) => setStart(e.target.value)} />
                          <div className="stopover-textboxes">
                              {stopovers.map((stopover, index) => (
                                  <input className='pf-input-style' key={index} type="text" placeholder={`${index + 1}번째 경유지`} value={stopover} onChange={(e) => handleStopoverChange(index, e.target.value)}/>
                              ))}
                          </div>
                        <input className='pf-input-style'type="text" placeholder="도착지를 입력하세요" value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>
                    <div className="button-row">
                      <button className="button-style" onClick={handleInputReset}>다시 입력</button>
                      <button className="button-style" onClick={addStopover}>경유지 추가</button>
                      <button className="button-style" onClick={handleFindPathClick}>길찾기 결과 보기</button>
                    </div>
                    {showShortestPathText && (
                      <div>
                        <div className="shortest-path-text">
                          [최단 경로 검색 결과]
                          <div id="total-distance">총 거리:  {totalDistance.toFixed(4)} m</div>
                          <img src={legend} alt="link_legend" style={{ width: '60%', margin: '0 auto' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>)}
                {activeTab === '3D' && <ThreeDContent />}
            </div>
            <div className='main-right-side'>
                {activeTab === '' && <Map width='100%' height='100vh' keyword={keyword} />}
                {activeTab === '길찾기' && <Map width='100%' height='100vh' keyword={keyword} pathData={pathData} />}
            </div>
        </div>
    );
};

export default App;
