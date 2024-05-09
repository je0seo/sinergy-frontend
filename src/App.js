// App.js
import React, { useRef, useState, KeyboardEvent } from 'react';
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
//
import irumarkerS from './components/images/IrumakerS.png';
import irumarkerE from './components/images/IrumakerE.png';
import irumarkerY from './components/images/IrumakerY.png';
//
import {Icons} from './components/MarkerStyle'

import { PopupUIComponent } from './components/PopupC';

const Header = ({ searchTerm, setSearchTerm, handleSearch, activeTab, handleTabChange, handleModeChange}) => {
    const inputRef = useRef(null);
    const handleKeyPress = (e) => {
        if (e.key === "Enter") { // Enter 키를 누르면 연결된 버튼을 클릭
            inputRef.current.click();
        }
    };
    return (
        <header className='header'>
            <div style={{width: '100%'}}>
                <img src={fullKLogo} alt="SㅣnerGY FLogo" style={{width: '200px',display: 'block',margin: '0 auto'}} />
            </div>
            <div className = 'header-search-bar line' style={{width: '100%', display: "flex"}}>
                <div className="search-bar">
                    <img src={SLogo} alt="SㅣnerGY SLogo" style={{padding:'2px', width:'19px'}}/>
                    <input type="text"
                           placeholder="검색어를 입력하세요"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           style={{margin: '0 Auto'}}
                           onKeyPress={handleKeyPress}
                    />
                    <button ref={inputRef} onClick={handleSearch}>검색</button>
                </div>
                <div>
                    <button onClick={handleModeChange}>barrier free mode</button>
                </div>
            </div>
        </header>
    );
}

/*function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch;
}*/

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
  const [slopeD, setSlopeD] = useState(3.18);
  const [bolC, setBolC] = useState(120);
  const [bumpC, setBumpC] = useState(2);
  const [stopovers, setStopovers] = useState([]);
  const [showShortestPathText, setShowShortestPathText] = useState(false);
  const [StartEndNormalCheckMessage, setStartEndNormalCheckMessage] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [pathData, setPathData] = useState(null);
  const [showText4deco, setShowText4deco] = useState(true);
  const [obstacleIDs, setObstacleIDs] = useState({ObstacleNodeIDs: [], ObstacleLinkIDs: []});

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
        obstacleIDs,
        slopeD,
        bolC,
        bumpC,
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

  const handleObstacleAvoidance = (obstacleID) => {
        // 주어진 obstacleID의 유형 판별
        const obstacleType = obstacleID.startsWith("node.") ? "node" : obstacleID.startsWith("link.") ? "link" : null;

        if (obstacleType === "node") {
            // obstacleID에서 접두사를 제거하여 순수한 ID 추출
            const nodeIdWithoutPrefix = obstacleID.replace(`${obstacleType}.`, "");

            // 배열에 이미 존재하는지 확인
            if (!obstacleIDs.ObstacleNodeIDs.includes(nodeIdWithoutPrefix)) {
                const updatedResults = [...obstacleIDs.ObstacleNodeIDs, nodeIdWithoutPrefix];
                // ObstacleIDs 객체의 ObstacleNodeIDs 배열 업데이트
                setObstacleIDs({ ...obstacleIDs, ObstacleNodeIDs: updatedResults });
            }
        }
        else if (obstacleType === "link") {
            // obstacleID에서 접두사를 제거하여 순수한 ID 추출
            const linkIdWithoutPrefix = obstacleID.replace(`${obstacleType}.`, "");

            // 배열에 이미 존재하는지 확인
            if (!obstacleIDs.ObstacleLinkIDs.includes(linkIdWithoutPrefix)) {
                const updatedResults = [...obstacleIDs.ObstacleLinkIDs, linkIdWithoutPrefix];
                // ObstacleIDs 객체의 ObstacleLinkIDs 배열 업데이트
                setObstacleIDs({ ...obstacleIDs, ObstacleLinkIDs: updatedResults });
            }
        }
        else {
            console.error("Invalid obstacleID format:", obstacleID);
        }
  };
  const handleRemoveObstacleNode = (indexToRemove) => {
        const updatedNodeIDs = obstacleIDs.ObstacleNodeIDs.filter((_, index) => index !== indexToRemove);
        const updatedObstacleIDs = {
            ObstacleNodeIDs: updatedNodeIDs,
            ObstacleLinkIDs: obstacleIDs.ObstacleLinkIDs
        };
        setObstacleIDs(updatedObstacleIDs);
  };
    const handleRemoveObstacleLink = (indexToRemove) => {
        const updatedLinkIDs = obstacleIDs.ObstacleLinkIDs.filter((_, index) => index !== indexToRemove);
        const updatedObstacleIDs = {
            ObstacleNodeIDs: obstacleIDs.ObstacleNodeIDs,
            ObstacleLinkIDs: updatedLinkIDs
        };
        setObstacleIDs(updatedObstacleIDs);
    };
  const addStopover = () => {
    setStopovers([...stopovers, '']);
  };
  const handleRemoveStopover = (indexToRemove) => {
        const updatedStopovers = stopovers.filter((_, index) => index !== indexToRemove);
        setStopovers(updatedStopovers);
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
    setSlopeD(3.18);
    setBolC(120);
    setBumpC(2);
    setStopovers([]);
    setShowShortestPathText(false);
    setStartEndNormalCheckMessage('');
    setShowText4deco(true);
    setTotalDistance(0);
    setPathData(null);
    setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});
  };

  return {
    features,
    start,
    end,
    slopeD,
    bolC,
    bumpC,
    stopovers,
    showShortestPathText,
    StartEndNormalCheckMessage,
    showText4deco,
    totalDistance,
    pathData,
    obstacleIDs,
    setFeatures,
    setStart,
    setEnd,
    setSlopeD,
    setBolC,
    setBumpC,
    setStopovers,
    setShowShortestPathText,
    setStartEndNormalCheckMessage,
    setShowText4deco,
    setTotalDistance,
    setPathData,
    setObstacleIDs,
    handleFindPathClick,
    addStopover,
    handleStopoverChange,
    handleRemoveStopover,
    handleInputReset,
    handleObstacleAvoidance,
    handleRemoveObstacleNode,
    handleRemoveObstacleLink
  };
};


const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [keyword, setKeyword] = useState(''); // info페이지 결과 검색 용도
    const [poiKeyword, setPoiKeyword] = useState('') // 지도 위 마커 띄울 대상 키워드 설정 용도

    const [BarrierFreeMode, setBarrierFreeMode] = useState(true);

    const [activeTab, setActiveTab] = useState('');
    const [showObstacleMenu, setShowObstacleMenu] = useState(false); // 상태 추가
    const [showFacilitiesMenu, setShowFacilitiesMenu] = useState( false);
    const [toggleLeftSide, setToggleLeftSide] = useState(true);
    const [toggleLeftSideFeature, setToggleLeftSideFeature] = useState('<')

    const [showReqIdsNtype, setShowReqIdsNtype] = useState({});
    const [bol, setBol] = useState({})
    const [bump, setBump] = useState({})
    const [showObsOnPath, setShowObsOnPath] = useState(false)

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

    const handleShowReq = async (ReqType) => {
        const data = await showReq(ReqType);
        setShowReqIdsNtype({ type: ReqType, data });
    }
    const handleModeChange = () => {
        setBarrierFreeMode(!BarrierFreeMode);
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
    const handleToggleLeftSide = () =>{
        setToggleLeftSide(!toggleLeftSide);
        if (toggleLeftSideFeature === '<'){
            setToggleLeftSideFeature('>');
        }
        else if(toggleLeftSideFeature === '>'){
            setToggleLeftSideFeature('<');
        }
    }
    //길찾기
    const {
      features,
      start,
      end,
      slopeD,
      bolC,
      bumpC,
      stopovers,
      showShortestPathText,
      StartEndNormalCheckMessage,
      showText4deco,
      totalDistance,
      pathData,
      obstacleIDs,
      setFeatures,
      setStart,
      setEnd,
      setSlopeD,
      setBolC,
      setBumpC,
      setObstacleIDs,
      handleFindPathClick,
      addStopover,
      handleStopoverChange,
      handleRemoveStopover,
      handleInputReset,
      handleObstacleAvoidance,
      handleRemoveObstacleNode,
      handleRemoveObstacleLink,
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
            {toggleLeftSide && (
            <div className="main-left-side">
                <Header handleSearch={() => {setKeyword(searchTerm);}} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleModeChange={handleModeChange}/>
                <div className='menu'>
                  <button onClick={() => handleTabChange('')} className={`menu-tab ${activeTab === '' ? 'active' : ''}`}>INFO</button>
                  <button onClick={() => handleTabChange('길찾기')} className={`menu-tab ${activeTab === '길찾기' ? 'active' : ''}`}>길찾기</button>
                    <button onClick={() => handleTabChange('3D')} className={`menu-tab ${activeTab === '3D' ? 'active' : ''}`}>배리어프리 길찾기</button>
                </div>
                {activeTab === '' && <div className='home-left'>
                    <div>
                        {/*
                        {!showFacilitiesMenu && (
                            <button className='showingBtn' onClick={() => {handleToggleFacilitiesMenu(); handleShowReq('facilities');}}>
                                <div><img src={facilitiesIcon} alt="Facilities Icon" className="iconImage" /> 편의시설 전체 보기</div>
                            </button>
                        )}
                        */}
                        {keyword != '' && <div className='info-page'><Search keyword={keyword} setKeyword={setKeyword} setFinalKeyword={setPoiKeyword}/></div>}
                        {BarrierFreeMode && (
                            <div style={{borderStyle: 'solid', borderColor: '#FFCD4A', marginBottom: '5px'}}>
                                <div style={{fontSize: '15px', textAlign: 'center', marginTop: '5px'}}>---보행 장애물 위치 보기---</div>
                                <div className='showingObstacleBtns'>
                                    {/*<button className='showingBtn' onClick={handleToggleObstacleMenu}>캠퍼스 내 장애물 보기 버튼 가리기</button>*/}
                                    <button className='showingBtn' onClick={() => handleShowReq('unpaved')}><img src={Icons.unpavedIcon} alt="Unpaved Road Icon" className="iconImage" />비포장도로</button>
                                    <button className='showingBtn' onClick={() => handleShowReq('stairs')}><img src={Icons.stairsIcon} alt="Stairs Icon" className="iconImage" />계단</button>
                                    <button className='showingBtn' onClick={() => handleShowReq('slope')}><img src={Icons.slopeIcon} alt="Slope Icon" className="iconImage" />경사로</button>
                                    <button className='showingBtn' onClick={() => handleShowReq('bump')}><img src={Icons.bumpIcon} alt="Bump Icon" className="iconImage" />도로턱</button>
                                    <button className='showingBtn' onClick={() => handleShowReq('bol')}><img src={Icons.bolIcon} alt="Bollard Icon" className="iconImage" />볼라드</button>
                                </div>
                            </div>
                        )}
                        <div style={{borderStyle: 'solid', borderColor: '#FFCD4A'}}>
                        <div style={{fontSize: '15px', textAlign: 'center', marginTop: '5px'}}>---편의 시설 위치 보기---</div>
                        {!showFacilitiesMenu &&( // showFacilitiesMenu 상태에 따라 보이게 설정
                            <div className='showingFacilitiesBtns'>
                                {/*<button className='showingBtn' onClick={handleToggleFacilitiesMenu}>캠퍼스 내 편의시설 종류별 보기 버튼 가리기</button> */}
                                {/*<button className='showingBtn' onClick={() => handleShowReq('facilities')}><div><img src={facilitiesIcon} alt="Facilities Icon" className="iconImage" /> 편의시설 전체 보기</div></button> */}
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('basketball')}><img src={Icons.basketballIcon} alt="Basketball Icon" className="iconImage" /></button>농구장</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('library')}><img src={Icons.libraryIcon} alt="libraryIcon" className="iconImage" /></button>도서관</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('Sbicycle')}><img src={Icons.sBicycleIcon} alt="S-Bicycle Icon" className="iconImage" /></button>따릉이 대여소</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('healthservice')}><img src={Icons.healthServiceIcon} alt="Health Service Icon" className="iconImage" /></button>보건소</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('print')}><img src={Icons.printIcon} alt="Print Icon" className="iconImage" /></button>복사실</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('bench')}><img src={Icons.benchIcon} alt="Bench Icon" className="iconImage" /></button>벤치</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('seminarroom')}><img src={Icons.seminarRoomIcon} alt="Seminar Room Icon" className="iconImage" /></button>세미나실</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('postoffice')}><img src={Icons.postOfficeIcon} alt="Post Office Icon" className="iconImage" /></button>우체국</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('atm')}><img src={Icons.atmIcon} alt="ATM Icon" className="iconImage" /></button>은행/ATM</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('vendingMachine')}><img src={Icons.vendingMachineIcon} alt="vendingMachineIcon" className="iconImage" /></button>자판기</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('bicycle')}><img src={Icons.bicycleIcon} alt="Bicycle Icon" className="iconImage" /></button>자전거 거치대</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('toilet')}><img src={Icons.toiletIcon} alt="toiletIcon" className="iconImage" /></button>장애인 화장실</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('cafe')}><img src={Icons.cafeIcon} alt="Cafe Icon" className="iconImage" /></button>카페</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('tennis')}><img src={Icons.tennisIcon} alt="Tennis Icon" className="iconImage" /></button>테니스장</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('store')}><img src={Icons.storeIcon} alt="Store Icon" className="iconImage" /></button>편의점</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('lounge')}><img src={Icons.loungeIcon} alt="Lounge Icon" className="iconImage" /></button>학생라운지</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('cafeteria')}><img src={Icons.cafeteriaIcon} alt="Cafeteria Icon" className="iconImage" /></button>학생식당</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('breakroom')}><img src={Icons.breakRoomIcon} alt="Break Room Icon" className="iconImage" /></button>휴게실</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('smoking')}><img src={Icons.smokingIcon} alt="Smoking Icon" className="iconImage" /></button>흡연구역</div>
                                <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('gym')}><img src={Icons.gymIcon} alt="Gym Icon" className="iconImage" /></button>헬스장</div>
                            </div>
                        )}
                        </div>
                    </div>
                    {/*<a href="https://www.uos.ac.kr/main.do?epTicket=INV">
                        <img src={UOSLogo} alt="UOS Logo for link" style={{ width: '160px', margin: '0 auto' }} />
                    </a>*/}
                    {showText4deco && keyword == '' && (
                        <div className="deco-text-style">
                            <p>서울시립대학교를 탐색해보세요!</p>
                        </div>
                    )}
                </div>}
                {activeTab === '길찾기' && (
                <div>
                  <div className="pathfinder-page">
                    <div className="input-row">
                        <div className="input">
                            <img src={irumarkerS} alt="start irumarker" className="irumarkerImage" />
                            <div className="input-box">
                                <input className='pf-input-style' type="text" placeholder="출발지를 입력하세요" value={start} onChange={(e) => setStart(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            {stopovers.map((stopover, index) => (
                                <div className="input" key={index}>
                                    <img src={irumarkerY} alt="stopover irumarker" className="irumarkerImage"/>
                                    <div className="input-box">
                                        <input className='pf-input-style' type="text" placeholder={`${index + 1}번째 경유지`} value={stopover} onChange={(e) => handleStopoverChange(index, e.target.value)}/>
                                        <button className='stopover-remove-button' onClick={() => handleRemoveStopover(index)}>―</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="input">
                            <img src={irumarkerE} alt="end irumarker" className="irumarkerImage"/>
                            <div className="input-box">
                                <input className='pf-input-style' type="text" placeholder="도착지를 입력하세요" value={end} onChange={(e) => setEnd(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="button-row">
                        <button className="button-style" onClick={addStopover}>+ 경유지</button>
                        <button className="button-style" onClick={() => {handleInputReset(); initialObsState(); setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});}}>⟲ 다시입력</button>
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
                                [최단 경로]
                                <div>
                                    <div id="total-distance">총 거리: {totalDistance.toFixed(4)} m  (예상 시간: 약 {(totalDistance / 64).toFixed(0)}분, {(totalDistance / 0.64).toFixed(0)} 걸음)</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showShortestPathText && StartEndNormalCheckMessage==='' && totalDistance !== null && totalDistance === 0 && (
                        <div className="warning-result-text">조건에 맞는 경로를 확인할 수 없습니다. 조건을 바꿔 검색해주세요</div>
                    )}
                    {showShortestPathText && StartEndNormalCheckMessage!=='' && !pathData && (
                        <div className="warning-result-text">
                            {StartEndNormalCheckMessage}
                        </div>
                    )}
                  </div>
                </div>)}
                {activeTab === '3D' && (
                    <div>
                        <div className="pathfinder-page">
                            {BarrierFreeMode && (
                                <div>
                                    <div className="option-button-row">
                                        <button className={`option-button ${features.unpaved ? 'selected-button' : ''}`} style={{ marginLeft: '5px' }} onClick={() => toggleFeature('unpaved')} >비포장도로 제외</button>
                                        <button className={`option-button ${features.stairs ? 'selected-button' : ''}`} onClick={() => toggleFeature('stairs')}>계단 제외</button>
                                        <button className={`option-button ${features.slope ? 'selected-button' : ''}`} onClick={() => toggleFeature('slope')}>경사로 제외</button>
                                        <button className={`option-button ${features.bump ? 'selected-button' : ''}`} onClick={() => toggleFeature('bump')}>도로턱 제외</button>
                                        <button className={`option-button ${features.bol ? 'selected-button' : ''}`} style={{ marginRight: '5px' }} onClick={() => toggleFeature('bol')} >볼라드 제외</button>
                                    </div>
                                    <div className='user-obs-option-setting'>
                                        {!showObstacleMenu && (<button className='option-toggle-btn' onClick={handleToggleObstacleMenu}>▽ 장애물 기준 설정창 열기 </button>)}
                                        {showObstacleMenu && (
                                            <div className="option-add">
                                                <div className="option-input">
                                                    경사로 경사도 임계값 설정[단위: °]
                                                    <div className="option-input-box">
                                                        <input className='op-input-style' type="text" placeholder="임계값" value={slopeD} onChange={(e) => setSlopeD(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="option-input">볼라드 간격 임계값 설정[단위: cm]<div className="option-input-box">
                                                    <input className='pf-input-style' type="text" placeholder="임계값" value={bolC} onChange={(e) => setBolC(e.target.value)} /></div>
                                                </div>
                                                <div className="option-input">도로턱 높이 임계값 설정[단위: cm]<div className="option-input-box">
                                                    <input className='pf-input-style' type="text" placeholder="임계값" value={bumpC} onChange={(e) => setBumpC(e.target.value)} /></div>
                                                </div>
                                            </div>)}
                                        {showObstacleMenu && (<button className='option-toggle-btn' onClick={handleToggleObstacleMenu}>△ 장애물 기준 설정창 닫기 </button>)}
                                    </div>
                                </div>
                            )} {/*배리어프리 모드 해당 끝*/}
                            <div className="input-row">
                                <div className="input">
                                    <img src={irumarkerS} alt="start irumarker" className="irumarkerImage" />
                                    <div className="input-box">
                                        <input className='pf-input-style' type="text" placeholder="출발지를 입력하세요" value={start} onChange={(e) => setStart(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    {stopovers.map((stopover, index) => (
                                        <div className="input" key={index}>
                                            <img src={irumarkerY} alt="stopover irumarker" className="irumarkerImage"/>
                                            <div className="input-box">
                                                <input className='pf-input-style' type="text" placeholder={`${index + 1}번째 경유지`} value={stopover} onChange={(e) => handleStopoverChange(index, e.target.value)}/>
                                                <button className='stopover-remove-button' onClick={() => handleRemoveStopover(index)}>―</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="stopover-add-button" onClick={addStopover}>+</button>
                                <div className="input">
                                    <img src={irumarkerE} alt="end irumarker" className="irumarkerImage"/>
                                    <div className="input-box">
                                        <input className='pf-input-style' type="text" placeholder="도착지를 입력하세요" value={end} onChange={(e) => setEnd(e.target.value)} />
                                    </div>
                                </div>
                            </div> {/*공통 끝*/}
                            {obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0 && (
                                <div className="button-row">
                                    <button className="button-style" onClick={() => {handleInputReset(); initialObsState(); setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});}}>⟲ 다시입력</button>
                                    <button className="button-style" onClick={() => {handleFindPathClick(); initialObsState();}}>길찾기 결과 보기</button>
                                </div>
                            )}
                            {showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                                <div>
                                    <div className="shortest-path-text">
                                        [최단 경로]
                                        <div>
                                            <div id="total-distance">총 거리: {totalDistance.toFixed(4)} m  (예상 시간: 약 {(totalDistance / 64).toFixed(0)}분, {(totalDistance / 0.64).toFixed(0)} 걸음)</div>
                                        </div>
                                    </div>
                                    {BarrierFreeMode && obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0 &&(
                                        <div>
                                            <button className="button-style" onClick={handleShowObsOnPath}>경로 내 장애물 표시</button>
                                        </div>
                                    )}
                                </div>
                            )} {/*공통: 길찾기 결과 있을 떄*/}
                            {!(obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0) && (
                                <div className="obstacles-list">
                                    [추가로 회피할 장애물 목록]
                                    <ul className="obstacles-node-list">
                                        {obstacleIDs.ObstacleNodeIDs.map((result, index) => (
                                            <li className="individual-obstacles-box" key={index}>
                                                <div className="individual-obstacles">node.{result}</div>
                                                <button className="obstacle-remove-button" onClick={() => handleRemoveObstacleNode(index)}>―</button>
                                            </li>))}
                                    </ul>
                                    <ul className="obstacles-link-list">
                                        {obstacleIDs.ObstacleLinkIDs.map((result, index) => (
                                            <li className="individual-obstacles-box" key={index}>
                                                <div className="individual-obstacles">link.{result}</div>
                                                <button className="obstacle-remove-button" onClick={() => handleRemoveObstacleLink(index)}>―</button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="button-row">
                                        <button className="button-style" onClick={() => {setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});}}>⟲ 목록 초기화</button>
                                        {showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                                        <button className="button-style" onClick={() => {handleFindPathClick().then(r => handleShowObsOnPath()); initialObsState(); }}>경로 재검색</button>)}
                                    </div>
                                </div>
                            )}
                            {showObsOnPath && showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                                <div>{<img src={legend} alt="link_legend" style={{ width: '50%', margin: '0 4mm 0 0' }} />}</div>)}
                        </div>
                        {showShortestPathText && StartEndNormalCheckMessage==='' && totalDistance !== null && totalDistance === 0 && (
                            <div>
                                <div className="warning-result-text">조건에 맞는 경로를 확인할 수 없습니다. 조건을 바꿔 검색해주세요</div>
                                {BarrierFreeMode && !(obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0) && (
                                    <div className="button-row">
                                        <button className="button-style" onClick={() => {handleInputReset(); initialObsState(); setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});}}>⟲ 다시입력</button>
                                        <button className="button-style" onClick={() => {handleFindPathClick().then(r => handleShowObsOnPath()); initialObsState(); }}>경로 재검색</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {showShortestPathText && StartEndNormalCheckMessage!=='' && !pathData && (
                            <div>
                                <div className="warning-result-text"> {StartEndNormalCheckMessage}</div>
                                <div className="button-row">
                                    <button className="button-style" onClick={() => {handleInputReset(); initialObsState(); setObstacleIDs({ObstacleNodeIDs: [], ObstacleLinkIDs: []});}}>⟲ 다시입력</button>
                                    <button className="button-style" onClick={() => {handleFindPathClick().then(r => handleShowObsOnPath()); initialObsState(); }}>경로 재검색</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}
            <div className='ToggleLeftSide'><button className='ToggleLeftSideBtn' onClick={() => {handleToggleLeftSide();}}>{toggleLeftSideFeature}</button></div>
            <div className='main-right-side'>
                {activeTab === '' && <Map width='100%' height='100vh' keyword={poiKeyword} category={showReqIdsNtype}/>}
                {activeTab === '길찾기'
                && <Map width='100%' height='100vh' pathData={pathData} bol={bol} bump={bump} showObs={showObsOnPath} onObstacleAvoidance={handleObstacleAvoidance}/>}
                {activeTab === '3D'
                    && <Map width='100%' height='100vh' pathData={pathData} bol={bol} bump={bump} showObs={showObsOnPath} onObstacleAvoidance={handleObstacleAvoidance}/>}
            </div>
        </div>
    );
};

export default App;
