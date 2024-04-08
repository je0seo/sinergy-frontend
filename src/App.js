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
import {NODE_BACKEND_URL} from "./constants/urls";
//
import Search from './components/Search';
//
import facilitiesIcon from './components/images/icons/facilitiesIcon.png';
import bumpIcon from './components/images/icons/bumpIcon.png';
import bolIcon from './components/images/icons/bolIcon.png';
import unpavedIcon from './components/images/icons/unpavedIcon.png';
import stairsIcon from './components/images/icons/stairsIcon.png';
import slopeIcon from './components/images/icons/slopeIcon.png';
import benchIcon from './components/images/icons/benchIcon.png';
import atmIcon from './components/images/icons/atmIcon.png';
import bicycleIcon from './components/images/icons/bicycleIcon.png';
import smokingIcon from './components/images/icons/smokingIcon.png';


const Header = ({ searchTerm, setSearchTerm, handleSearch, activeTab, handleTabChange}) => {
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
  const [StartEndNormalCheckMessage, setStartEndNormalCheckMessage] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [pathData, setPathData] = useState(null);
  const [showText4deco, setShowText4deco] = useState(true);

  const handlePathResult = (data) => {
    const calculatedTotalDistance = data.minAggCost;
    setTotalDistance(calculatedTotalDistance);
    setShowShortestPathText(true);
    setShowText4deco(false);
    const shortestPath = data.shortestPath;
    //console.log("data.userReqNum:", data.userReqNum);
    if (data.userReqNum.length === 1 && data.userReqNum[0] === 0){
        setStartEndNormalCheckMessage("출발지 오류입니다. 다시한번 확인해주세요");
        setPathData(null);
        //console.log("출발지 오류입니다. 다시한번 확인해주세요");
    }
    if (data.userReqNum.length === 2 && data.userReqNum[0] === 0 && data.userReqNum[1] === 0){
        setStartEndNormalCheckMessage("도착지 오류입니다. 다시한번 확인해주세요");
        setPathData(null);
        //console.log("도착지 오류입니다. 다시한번 확인해주세요");
    }
    if (shortestPath) {
      setPathData(shortestPath);
    }
  };
  const PathObstacleShow = async () => {
      console.log("길찾기 결과 내 장애물을 표출합니다.")
  }
  const handleFindPathClick = async () => {
    try {
      const requestData = {
        start,
        end,
        stopovers,
        features,
      };
      if (start===""){
          alert("출발지가 입력되지 않았습니다. 다시한번 확인해주세요")
      } else if(end===""){
          alert("도착지가 입력되지 않았습니다. 다시한번 확인해주세요")
      } else{
          //console.log('중간점검용:', requestData);
          try {
          var response = await axios.post(NODE_BACKEND_URL+'/findPathServer', requestData, {
              headers: {
                  'Content-Type': 'application/json',
              },
          });
          handlePathResult(response.data);
      } catch (error) {
          console.error('Error during Axios POST request', error);
      }}
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
    setStartEndNormalCheckMessage('');
    setShowText4deco(true);
    setTotalDistance(0);
    setPathData(null);
  };

  return {
    features,
    start,
    end,
    stopovers,
    showShortestPathText,
    StartEndNormalCheckMessage,
    showText4deco,
    totalDistance,
    pathData,
    setFeatures,
    setStart,
    setEnd,
    setStopovers,
    setShowShortestPathText,
    setStartEndNormalCheckMessage,
    setShowText4deco,
    setTotalDistance,
    setPathData,
    handleFindPathClick,
    PathObstacleShow,
    addStopover,
    handleStopoverChange,
    handleInputReset,
  };
};


const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [showObstacleMenu, setShowObstacleMenu] = useState(false); // 상태 추가
    const [showFacilitiesMenu, setShowFacilitiesMenu] = useState( false);
    const [showReqIdsNtype, setShowReqIdsNtype] = useState({});
    const [markerClicked, setMarkerClicked] = useState(false);

    const handleShowReq = async (ReqType) => {
        const data = await showReq(ReqType);
        setShowReqIdsNtype({ type: ReqType, data });
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    const handleToggleObstacleMenu = () => {
        setShowObstacleMenu(!showObstacleMenu);
    };
    const handleToggleFacilitiesMenu = () =>{
        setShowFacilitiesMenu(!showFacilitiesMenu);
    }
    //길찾기
    const {
      features,
      start,
      end,
      stopovers,
      showShortestPathText,
      StartEndNormalCheckMessage,
      showText4deco,
      totalDistance,
      pathData,
      setFeatures,
      setStart,
      setEnd,
      handleFindPathClick,
      PathObstacleShow,
      addStopover,
      handleStopoverChange,
      handleInputReset,
    } = usePathfinding();
  
    const toggleFeature = (feature) => {
      setFeatures({ ...features, [feature]: !features[feature] });
    };
    const showReq = async (Req) => {
        try {
            const response = await axios.post(NODE_BACKEND_URL + '/ShowReq', { Req }, {
                headers: {'Content-Type': 'application/json'},
            });
            return response.data
        } catch (error) {
            console.error('Error during Axios POST request while Showing Request Maker', error);
        }
    };

    return (
        <div className='container' >
            <div className="main-left-side">
                <Header handleSearch={() => {
                    setKeyword(searchTerm);
                }} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <div className='menu'>
                  <button onClick={() => handleTabChange('')} className={`menu-tab ${activeTab === '' ? 'active' : ''}`}>INFO</button>
                  <button onClick={() => handleTabChange('길찾기')} className={`menu-tab ${activeTab === '길찾기' ? 'active' : ''}`}>길찾기</button>
                  <button onClick={() => handleTabChange('3D')} className={`menu-tab ${activeTab === '3D' ? 'active' : ''}`}>3D</button>
                </div>

                {activeTab === '' && <div className='home-left'>
                    <div>
                        {!showFacilitiesMenu && (
                            <button className='showingBtn' onClick={() => {handleToggleFacilitiesMenu(); handleShowReq('facilities');}}>
                                <div>
                                    <img src={facilitiesIcon} alt="Facilities Icon" className="iconImage" /> {/* 이미지 크기 조절 */}
                                    편의시설 보기
                                </div>
                            </button>
                        )}
                        {showFacilitiesMenu &&( // showFacilitiesMenu 상태에 따라 보이게 설정
                            <div className='showingFacilitiesBtns'>
                                <button className='showingBtn' onClick={handleToggleFacilitiesMenu}>캠퍼스 내 편의시설 종류별 보기 버튼 가리기</button>
                                <button className='showingBtn' onClick={() => handleShowReq('atm')}>
                                    <img src={atmIcon} alt="ATM Icon" className="iconImage" />
                                    ATM
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('bench')}>
                                    <img src={benchIcon} alt="Bench Icon" className="iconImage" />
                                    벤치
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('bicycle')}>
                                    <img src={bicycleIcon} alt="Bicycle Icon" className="iconImage" />
                                    따릉이 대여소
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('smoking')}>
                                    <img src={smokingIcon} alt="Smoking Icon" className="iconImage" />
                                    흡연부스
                                </button>
                            </div>
                        )}
                        {!showObstacleMenu && (
                            <button className='showingBtn' onClick={handleToggleObstacleMenu}>캠퍼스 내 장애물 보기 버튼 </button>
                        )}
                        {showObstacleMenu && ( // showObstacleMenu 상태에 따라 보이게 설정
                            <div className='showingObstacleBtns'>
                                <button className='showingBtn' onClick={handleToggleObstacleMenu}>캠퍼스 내 장애물 보기 버튼 가리기</button>
                                <button className='showingBtn' onClick={() => handleShowReq('unpaved')}>
                                    <img src={unpavedIcon} alt="Unpaved Road Icon" className="iconImage" />
                                    비포장도로 보기
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('stairs')}>
                                    <img src={stairsIcon} alt="Stairs Icon" className="iconImage" />
                                    계단 보기
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('slope')}>
                                    <img src={slopeIcon} alt="Slope Icon" className="iconImage" />
                                    경사로 보기
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('bump')}>
                                    <img src={bumpIcon} alt="Bump Icon" className="iconImage" />
                                    도로턱 보기
                                </button>
                                <button className='showingBtn' onClick={() => handleShowReq('bol')}>
                                    <img src={bolIcon} alt="Bollard Icon" className="iconImage" />
                                    볼라드 보기
                                </button>
                            </div>
                        )}
                    </div>
                    <a href="https://www.uos.ac.kr/main.do?epTicket=INV">
                        <img src={UOSLogo} alt="UOS Logo for link" style={{ width: '160px', margin: '0 auto' }} />
                    </a>
                    {showText4deco && keyword == '' && (
                        <div className="deco-text-style">
                            <p>서울시립대학교 어디가 궁금하세요?</p>
                        </div>
                    )}
                    {keyword != '' && !showFacilitiesMenu && !showObstacleMenu && <div className='info-page'>
                          <Search keyword = {keyword} />
                    </div>}
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
                    {showText4deco && (
                        <div className="deco-text-style">
                            <p>서울시립대학교 어디로 안내할까요?</p>
                        </div>
                    )}
                    {showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                        <div>
                            <div className="shortest-path-text">
                                [최단 경로 검색 결과]
                                <div id="total-distance">총 거리: {totalDistance.toFixed(4)} m</div>
                                <img src={legend} alt="link_legend" style={{ width: '60%', margin: '0 auto' }} />
                            </div>
                            <button className="button-style" onClick={PathObstacleShow}>경로 내 장애물 표시</button>
                        </div>
                    )}
                    {showShortestPathText && StartEndNormalCheckMessage==='' && totalDistance !== null && totalDistance === 0 && (
                        <div className="shortest-path-text">
                            조건에 맞는 경로를 확인할 수 없습니다. 조건을 바꿔 검색해주세요.
                        </div>
                    )}
                    {showShortestPathText && StartEndNormalCheckMessage!=='' && !pathData && (
                        <div className="shortest-path-text">
                            {StartEndNormalCheckMessage}
                        </div>
                    )}
                  </div>
                </div>)}
                {activeTab === '3D' && <ThreeDContent />}
            </div>
            <div className='main-right-side'>
                {activeTab === '' && <Map width='100%' height='100vh' keyword={keyword} ShowReqIdsNtype={showReqIdsNtype}/>}
                {activeTab === '길찾기'
                && <Map width='100%' height='100vh' keyword={keyword} setKeyword={setKeyword} pathData={pathData}
                /*markerClicked={markerClicked} setMarkerClicked={setMarkerClicked}*/ />}
            </div>
        </div>
    );
};

export default App;
