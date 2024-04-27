// App.js
import React, { useState } from 'react';
import UOSLogo from './components/images/uosMark.png';
import {MapC as Map} from './components/MapC';
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
//import HandleCategoryClick from './components/HandleCategoryClick';
//
import irumarkerS from './components/images/IrumakerS.png';
import irumarkerE from './components/images/IrumakerE.png';
import irumarker2 from './components/images/Irumaker2.png';
//
import bumpIcon from './components/images/icons/bumpIcon.png';
import bolIcon from './components/images/icons/bolIcon.png';
import unpavedIcon from './components/images/icons/unpavedIcon.png';
import stairsIcon from './components/images/icons/stairsIcon.png';
import slopeIcon from './components/images/icons/slopeIcon.png';
import facilitiesIcon from './components/images/icons/facilitiesIcon.png';
import benchIcon from './components/images/icons/benchIcon.png';
import atmIcon from './components/images/icons/atmIcon.png';
import bicycleIcon from './components/images/icons/bicycleIcon.png';
import smokingIcon from './components/images/icons/smokingIcon.png';
import storeIcon from './components/images/icons/storeIcon.png';
import cafeIcon from './components/images/icons/cafeIcon.png';
import postOfficeIcon from './components/images/icons/postOfficeIcon.png';
import healthServiceIcon from './components/images/icons/healthServiceIcon.png';
import cafeteriaIcon from './components/images/icons/cafeteriaIcon.png';
import printIcon from './components/images/icons/printIcon.png';
import gymIcon from './components/images/icons/gymIcon.png';
import tennisIcon from './components/images/icons/tennisIcon.png';
import basketballIcon from './components/images/icons/basketballIcon.png';
import breakRoomIcon from './components/images/icons/breakRoomIcon.png';
import loungeIcon from './components/images/icons/loungeIcon.png';
import seminarRoomIcon from './components/images/icons/seminarRoomIcon.png';
import sBicycleIcon from './components/images/icons/sBicycleIcon.png';
import vendingMachineIcon from './components/images/icons/vendingMachineIcon.png';
import libraryIcon from './components/images/icons/libraryIcon.png';
import toiletIcon from './components/images/icons/toiletIcon.png';


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
    addStopover,
    handleStopoverChange,
    handleInputReset,
  };
};


const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('');
    //const [showObstacleMenu, setShowObstacleMenu] = useState(false); // 상태 추가
    const [showFacilitiesMenu, setShowFacilitiesMenu] = useState( false);
    const [showReqIdsNtype, setShowReqIdsNtype] = useState({});
    const [bol, setBol] = useState({})
    const [bump, setBump] = useState({})
    const [showObsOnPath, setShowObsOnPath] = useState(false)
    //const [markerClicked, setMarkerClicked] = useState(false);

    const handleShowObsOnPath = async() => {
        let data = await showReq('bol');
        setBol({type: 'bol', data})
        data = await showReq('bump');
        setBump({type: 'bump', data})
        setShowObsOnPath(true);
    }
    const initialObsState = () => {
        setBol({})
        setBump({})
        setShowObsOnPath(false)
    }

    const HandleShowReq = async (ReqType) => {
        const data = await showReq(ReqType);
        setShowReqIdsNtype({ type: ReqType, data });
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    /*const handleToggleObstacleMenu = () => {
        setShowObstacleMenu(!showObstacleMenu);
    };*/
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
                        {/*
                        {!showFacilitiesMenu && (
                            <button className='showingBtn' onClick={() => {handleToggleFacilitiesMenu(); HandleShowReq('facilities');}}>
                                <div><img src={facilitiesIcon} alt="Facilities Icon" className="iconImage" /> 편의시설 전체 보기</div>
                            </button>
                        )}
                        */}
                        {!showFacilitiesMenu &&( // showFacilitiesMenu 상태에 따라 보이게 설정
                            <div className='showingFacilitiesBtns'>
                                {/*<button className='showingBtn' onClick={handleToggleFacilitiesMenu}>캠퍼스 내 편의시설 종류별 보기 버튼 가리기</button> */}
                                {/*<button className='showingBtn' onClick={() => HandleShowReq('facilities')}><div><img src={facilitiesIcon} alt="Facilities Icon" className="iconImage" /> 편의시설 전체 보기</div></button> */}
                                <button className='showingFacBtn' onClick={() => HandleShowReq('Sbicycle')}><img src={sBicycleIcon} alt="S-Bicycle Icon" className="iconImage" />따릉이 대여소</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('bicycle')}><img src={bicycleIcon} alt="Bicycle Icon" className="iconImage" />자전거 거치대</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('bench')}><img src={benchIcon} alt="Bench Icon" className="iconImage" />{/* 이미지 크기 조절 */}벤치</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('smoking')}><img src={smokingIcon} alt="Smoking Icon" className="iconImage" />흡연구역</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('store')}><img src={storeIcon} alt="Store Icon" className="iconImage" />편의점</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('cafe')}><img src={cafeIcon} alt="Cafe Icon" className="iconImage" />카페</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('atm')}><img src={atmIcon} alt="ATM Icon" className="iconImage" />은행/ATM</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('postoffice')}><img src={postOfficeIcon} alt="Post Office Icon" className="iconImage" />우체국</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('healthservice')}><img src={healthServiceIcon} alt="Health Service Icon" className="iconImage" />보건소</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('cafeteria')}><img src={cafeteriaIcon} alt="Cafeteria Icon" className="iconImage" />학생식당</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('print')}><img src={printIcon} alt="Print Icon" className="iconImage" />복사실</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('gym')}><img src={gymIcon} alt="Gym Icon" className="iconImage" />헬스장</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('tennis')}><img src={tennisIcon} alt="Tennis Icon" className="iconImage" />테니스장</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('basketball')}><img src={basketballIcon} alt="Basketball Icon" className="iconImage" />농구장</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('breakroom')}><img src={breakRoomIcon} alt="Break Room Icon" className="iconImage" />휴게실</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('lounge')}><img src={loungeIcon} alt="Lounge Icon" className="iconImage" />학생라운지</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('seminarroom')}><img src={seminarRoomIcon} alt="Seminar Room Icon" className="iconImage" />세미나실</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('vendingMachine')}><img src={vendingMachineIcon} alt="vendingMachineIcon" className="iconImage" />자판기</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('library')}><img src={libraryIcon} alt="libraryIcon" className="iconImage" />도서관</button>
                                <button className='showingFacBtn' onClick={() => HandleShowReq('toilet')}><img src={toiletIcon} alt="toiletIcon" className="iconImage" />장애인 화장실</button>
                            </div>
                        )}
                        {/* {!showObstacleMenu && (
                            <button className='showingBtn' onClick={handleToggleObstacleMenu}>캠퍼스 내 장애물 보기 버튼 </button>
                        )}*/}
                        {/*{showObstacleMenu && ( // showObstacleMenu 상태에 따라 보이게 설정*/}
                            <div className='showingObstacleBtns'>
                                {/*<button className='showingBtn' onClick={handleToggleObstacleMenu}>캠퍼스 내 장애물 보기 버튼 가리기</button>*/}
                                <button className='showingBtn' onClick={() => HandleShowReq('unpaved')}><img src={unpavedIcon} alt="Unpaved Road Icon" className="iconImage" />비포장도로</button>
                                <button className='showingBtn' onClick={() => HandleShowReq('stairs')}><img src={stairsIcon} alt="Stairs Icon" className="iconImage" />계단</button>
                                <button className='showingBtn' onClick={() => HandleShowReq('slope')}><img src={slopeIcon} alt="Slope Icon" className="iconImage" />경사로</button>
                                <button className='showingBtn' onClick={() => HandleShowReq('bump')}><img src={bumpIcon} alt="Bump Icon" className="iconImage" />도로턱</button>
                                <button className='showingBtn' onClick={() => HandleShowReq('bol')}><img src={bolIcon} alt="Bollard Icon" className="iconImage" />볼라드</button>
                            </div>
                        {/*)}*/}
                    </div>
                    {/*<a href="https://www.uos.ac.kr/main.do?epTicket=INV">
                        <img src={UOSLogo} alt="UOS Logo for link" style={{ width: '160px', margin: '0 auto' }} />
                    </a>*/}
                    {showText4deco && keyword == '' && (
                        <div className="deco-text-style">
                            <p>서울시립대학교 어디가 궁금하세요?</p>
                        </div>
                    )}
                    {keyword != '' && <div className='info-page'> {/* && !showFacilitiesMenu && !showObstacleMenu */}
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
                        <div>
                            <img src={irumarkerS} alt="start irumarker" className="irumarkerImage" />
                            <input className='pf-input-style' type="text" placeholder="출발지를 입력하세요" value={start} onChange={(e) => setStart(e.target.value)} />
                        </div>
                            <div className="stopover-textboxes">
                              {stopovers.map((stopover, index) => (
                                  <div>
                                      <img src={irumarker2} alt="stopover irumarker" className="irumarkerImage"/>
                                      <input className='pf-input-style' key={index} type="text" placeholder={`${index + 1}번째 경유지`} value={stopover} onChange={(e) => handleStopoverChange(index, e.target.value)}/>
                                  </div>
                              ))}
                          </div>
                        <div>
                            <img src={irumarkerE} alt="end irumarker" className="irumarkerImage"/>
                            <input className='pf-input-style'type="text" placeholder="도착지를 입력하세요" value={end} onChange={(e) => setEnd(e.target.value)} />
                        </div>
                    </div>
                    <div className="button-row">
                      <button className="button-style" onClick={handleInputReset}>다시 입력</button>
                      <button className="button-style" onClick={addStopover}>경유지 추가</button>
                      <button className="button-style" onClick={() => {handleFindPathClick(); initialObsState();}}>길찾기 결과 보기</button>
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
                            <button className="button-style" onClick={handleShowObsOnPath}>경로 내 장애물 표시</button>
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
                {activeTab === '' && <Map width='100%' height='100vh' keyword={keyword} category ={showReqIdsNtype} />}
                {/*activeTab === '' && showReqIdsNtype.type && <HandleCategoryClick category = {showReqIdsNtype} />*/}
                {activeTab === '길찾기'
                && <Map width='100%' height='100vh' keyword={keyword} setKeyword={setKeyword} pathData={pathData}
                bol = {bol} bump = {bump} showLinkObs = {showObsOnPath}
                /*markerClicked={markerClicked} setMarkerClicked={setMarkerClicked}*/ />}
            </div>
        </div>
    );
};

export default App;
