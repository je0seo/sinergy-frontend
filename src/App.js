// App.js
import React, { useRef, useState, KeyboardEvent } from 'react';
import {MapC as Map} from './components/MapC';
import fullKLogo from './components/images/fullKLogo.png';
import fullKLogoG from './components/images/fullKLogoG.png';
import SLogo from './components/images/SLogo.png';
import searchicon from './components/images/search.png';
import './App.css'; // App.css 파일을 import

// FindPathContent.js
import legend_mixed from './components/images/legend_mixed.png';
import legend_sidewalk from './components/images/legend_sidewalk.png';
import legend_wheelchair from './components/images/legend_wheelchair.png';
import legend_crosswalk from './components/images/legend_crosswalk.png';
import legend_stair from './components/images/legend_stair.png';
import legend_unpaved from './components/images/legend_unpaved.png';
import legend_slope from './components/images/legend_slope.png';
import legend_in from './components/images/legend_indoor.png';


import axios from 'axios';
import {NODE_BACKEND_URL} from "./constants/urls";
//
import Search from './components/Search';
//
import irumarkerS from './components/images/IrumakerS.png';
import irumarkerE from './components/images/IrumakerE.png';
import irumarkerG from './components/images/IrumakerG.png';
//
import {Icons} from './components/MarkerStyle'

import { PopupUIComponent } from './components/PopupC';

const Header = ({ searchTerm, setSearchTerm, handleSearch, handleModeChange, BarrierFreeMode}) => {
    const inputRef = useRef(null);
    const handleKeyPress = (e) => {
        if (e.key === "Enter") { // Enter 키를 누르면 연결된 버튼을 클릭
            inputRef.current.click();
        }
    };
    let Logo;
    if (BarrierFreeMode){
        Logo = fullKLogoG;
    }
    else if (!BarrierFreeMode){
        Logo = fullKLogo;
    }
    return (
        <header className='header'>
            <img src={Logo} alt="SㅣnerGY FLogo" style={{width: '154px', display: 'flex',margin: ' 0 auto'}} />
            <div className = 'header-search-bar-line' style={{width: '100%', display: "flex"}}>
                <div className="search-bar">
                    <img src={SLogo} alt="SㅣnerGY SLogo" style={{padding:'3px', width:'20px'}}/>
                    <input type="text"
                           placeholder="검색어를 입력하세요"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           style={{margin: '1px Auto'}}
                           onKeyPress={handleKeyPress}
                    />
                    <button ref={inputRef} onClick={handleSearch} style={{fontSize: '20%'}}><img src={searchicon} alt="SㅣnerGY SLogo" style={{padding:'3px', width:'17px'}}/></button>
                </div>
                <div className="barrier-free-switch">
                    <a style={{fontSize: '10px', color: '#00b398', marginBottom: '5px', textAlign:"center", fontWeight: 'bold'}}>barrier-free</a>
                    <input type="checkbox" id="switch" checked={BarrierFreeMode} onChange={handleModeChange}/><label htmlFor="switch">
                </label>
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
  const STOPOVER_MAX_INDEX = 3;
  const [showShortestPathText, setShowShortestPathText] = useState(false);
  const [StartEndNormalCheckMessage, setStartEndNormalCheckMessage] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [pathData, setPathData] = useState(null);
  const [showText4deco, setShowText4deco] = useState(true);
  const [obstacleIDs, setObstacleIDs] = useState({ObstacleNodeIDs: [], ObstacleLinkIDs: []});
  const [legendState, setLegend] = useState({
      stair: false,
      unpaved: false,
      slope: false,
      indoor: false
  });

  const setExist = (key, value) => {
    setLegend(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

  const initLegend = () => {    // 범례 상태 초기화
    setLegend(prevState => {
      const updatedState = {};
      for (const [key, _] of Object.entries(prevState)) {
        updatedState[key] = false;
      }
      return updatedState;
    });
  }

  const handleLegendState = (pathData) => {
    let stairFound = false;
    let unpavedFound = false;
    let slopeFound = false;
    let indoorFound = false;

    pathData.forEach((path, index) => {
      path.forEach(item => {
          if (!stairFound && item.link_att == 5) {   // 계단
            setExist('stair',true)
            stairFound = true
          } else if (!unpavedFound && item.link_att == 4) {   // 비포장
            setExist('unpaved',true)
            unpavedFound = true
          } else if (!slopeFound && item.link_att !== 5 && item.grad_deg>=3.18){    // 경사로
            setExist('slope',true)
            slopeFound = true
          } else if (!indoorFound && item.link_att == 6){    // 실내
            setExist('indoor',true)
            indoorFound = true
          }
      });
      if (stairFound && unpavedFound && slopeFound && indoorFound )   // 이미 이전 path에서 다 존재 하는 거 확인했으면 종료
       return
    });
  }

  const handlePathResult = (data) => {
    if (data.StartEndNormalCheckMessage){
        setStartEndNormalCheckMessage(data.StartEndNormalCheckMessage);
        console.log(StartEndNormalCheckMessage);
    }
    else{
        const calculatedTotalDistance = data.minAggCost;
        setTotalDistance(calculatedTotalDistance);
        setShowShortestPathText(true);
        setShowText4deco(false);
        const shortestPath = data.shortestPath;
        //console.log("data.userReqNum:", data.userReqNum);

        if (shortestPath) {
            setPathData(shortestPath);
            handleLegendState(shortestPath)
        }
    }

  };

  const handleFindPathClick = async () => {
    setStartEndNormalCheckMessage('');
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
    console.log(stopovers)
    if (stopovers.length >= STOPOVER_MAX_INDEX) // >3하면 한 번 stopovers값이 초기화 되는 과정 때문에 경유지 추가 버튼을 한 번 더 클릭해야 다시 처음부터 추가 가능
      handleInputReset();
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
    initLegend();
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
    legendState,
    initLegend,
    slopeD,
    bolC,
    bumpC,
    stopovers,
    STOPOVER_MAX_INDEX,
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

    const handleChange = (e) => {
        const value = parseFloat(e.target.value).toFixed(2);
        setSlopeD(Number(value));
    };

    const [showReqIdsNtype, setShowReqIdsNtype] = useState({});
    const [bol, setBol] = useState({})
    const [bump, setBump] = useState({})
    const [showObsOnPath, setShowObsOnPath] = useState(false)

    const handleShowObsOnPath = async() => {
        let data = await showReq({ReqType: 'bol', bolC: bolC});
        setBol({type: 'bol', data})
        data = await showReq({ReqType: 'bump', bumpC: bumpC});
        setBump({type: 'bump', data})
        setShowObsOnPath(true);
    }
    const initialObsState = () => {
        setBol({})
        setBump({})
        setShowObsOnPath(false)
    }

    const handleShowReq = async (ReqType) => {
        const data = await showReq({ReqType, slopeD, bolC, bumpC});
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
      legendState,
      initLegend,
      slopeD,
      bolC,
      bumpC,
      stopovers,
      STOPOVER_MAX_INDEX,
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
                <div className = 'fixed-bar'>
                <Header handleSearch={() => {setKeyword(searchTerm);}} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleModeChange={handleModeChange} BarrierFreeMode={BarrierFreeMode}/>
                <div className='menu'>
                  <button onClick={() => handleTabChange('')} className={`menu-tab ${activeTab === '' ? 'active' : ''}`}>INFO</button>
                  <button onClick={() => handleTabChange('길찾기')} className={`menu-tab ${activeTab === '길찾기' ? 'active' : ''}`}>길찾기</button>
                </div>
                </div>
                {activeTab === '' && <div className='home-left'>
                    <div>
                        {keyword != '' && <div className='info-page'><Search keyword={keyword} setKeyword={setKeyword} setFinalKeyword={setPoiKeyword}/></div>}
                        {BarrierFreeMode && (
                            <div style={{borderStyle: 'solid', borderColor: '#FFCD4A', margin: '0 10px 3px 7px'}}>
                                <div style={{fontSize: '14px', textAlign: 'center',margin: '3px 0 5px 0', fontFamily: 'Pretendard-Regular'}}>캠퍼스 내 장애물 위치 보기</div>
                                <div className='showingObstacleBtns'>
                                    <button className='option-toggle-btn' onClick={handleToggleObstacleMenu}><img src={Icons.settingsIcon} alt="Setting Icon" className="iconImage" style={{width: '25px', height: '25px'}}/></button>
                                    <div className='showingBtnT'><button className='showingBtn' onClick={() => handleShowReq('unpaved')}><img src={Icons.unpavedIcon} alt="Unpaved Road Icon" className="iconImage"/></button>비포장도로</div>
                                    <div className='showingBtnT'><button className='showingBtn' onClick={() => handleShowReq('stairs')}><img src={Icons.stairsIcon} alt="Stairs Icon" className="iconImage" /></button>계단</div>
                                    <div className='showingBtnT'><button className='showingBtn' onClick={() => handleShowReq('slope')}><img src={Icons.slopeIcon} alt="Slope Icon" className="iconImage" /></button>경사로</div>
                                    <div className='showingBtnT'><button className='showingBtn' onClick={() => handleShowReq('bump')}><img src={Icons.bumpIcon} alt="Bump Icon" className="iconImage" /></button>도로턱</div>
                                    <div className='showingBtnT'><button className='showingBtn' onClick={() => handleShowReq('bol')}><img src={Icons.bolIcon} alt="Bollard Icon" className="iconImage" /></button>볼라드</div>
                                </div>
                                {showObstacleMenu && (
                                    <div className='user-obs-option-setting'>
                                        <div className="slidecontainer">
                                            <div className="slider-row">
                                                1°
                                                <input className='slider' type="range" min="1" max="6.00" step="0.001" value={slopeD} onChange={handleChange} placeholder="임계값"/>
                                                6°
                                            </div>
                                            <div className='option-setting'> 경사각도
                                                <input className='slider-result' type="text" placeholder="임계값" value={slopeD} onChange={(e) => setSlopeD(e.target.value)}/>
                                                [°] ( 기울기: {(slopeD*3.14/180*100).toFixed(2)}%) 이상 제외
                                            </div>
                                        </div>
                                        <div className="slidecontainer">
                                            <div className="slider-row">
                                                40cm
                                                <input className='slider' type="range" min="40" max="160" value={bolC} onChange={(e) => setBolC(e.target.value)} placeholder="임계값"/>
                                                150cm
                                            </div>
                                            <div className='option-setting'> 볼라드 간격
                                                <input className='slider-result' type="text" placeholder="임계값" value={bolC} onChange={(e) => setBolC(e.target.value)}/>
                                                [cm] 이하 제외
                                            </div>
                                        </div>
                                        <div className="slidecontainer">
                                            <div className="slider-row">
                                                1.0cm
                                                <input className='slider' type="range" min="1" max="8" step="0.10" value={bumpC} onChange={(e) => setBumpC(e.target.value)} placeholder="임계값"/>
                                                8.0cm
                                            </div>
                                            <div className='option-setting'> 도로턱 높이
                                                <input className='slider-result' type="text" placeholder="임계값" value={bumpC} onChange={(e) => setBumpC(e.target.value)}/>
                                                [cm] 이상 제외
                                            </div>
                                        </div>
                                        <div style={{fontSize: '13px'}}>* 초기값 ( <strong>경사도: 3.18°, 볼라드 간격: 120cm, 도로턱 높이: 2cm</strong> )<br/> 출처: 장애인·노인·임산부 등의 편의증진보장에 관한 법률 시행규칙</div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{borderStyle: 'solid', borderColor: '#FFCD4A', margin: '3px 10px 8px 7px', display: 'flex', flexDirection: 'column',alignItems: 'center', justifyContent: 'center',}}>
                        <div style={{fontSize: '14px', textAlign: 'center', marginTop: '3px', marginBottom: '3px', display: 'flex', flexDirection: 'column',alignItems: 'center', justifyContent: 'center', fontFamily: 'Pretendard-Regular', padding: '0'}}>편의시설 둘러보기</div>
                        {!showFacilitiesMenu &&( // showFacilitiesMenu 상태에 따라 보이게 설정
                            <div className='showingFacilitiesBtns'>
                                {BarrierFreeMode && (<div className='showingFacBtn-category'>
                                    <div className='showingFacBtnText'>지원<br></br>시설</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('toilet')}><img src={Icons.toiletIcon} alt="toiletIcon" className="showingFacBtn-iconImage" /></button>장애인 화장실</div>
                                </div>)}
                                <div className='showingFacBtn-category'>
                                    <div className='showingFacBtnText'>운동<br></br>시설</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('basketball')}><img src={Icons.basketballIcon} alt="Basketball Icon" className="showingFacBtn-iconImage" /></button>농구장</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('squash')}><img src={Icons.squashIcon} alt="Squash Icon" className="showingFacBtn-iconImage" /></button>스쿼시장</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('foot volley')}><img src={Icons.footvolleyballIcon} alt="foot volley ball Icon" className="showingFacBtn-iconImage" /></button>족구장</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('tennis')}><img src={Icons.tennisIcon} alt="Tennis Icon" className="showingFacBtn-iconImage" /></button>테니스장</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('gym')}><img src={Icons.gymIcon} alt="Gym Icon" className="showingFacBtn-iconImage" /></button>헬스장</div>
                                </div>
                                <div className='showingFacBtn-category'><div className='showingFacBtnText'>식당</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('restaurant')}><img src={Icons.restaurantIcon} alt="Cafeteria Icon" className="showingFacBtn-iconImage" /></button>식당</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('cafe')}><img src={Icons.cafeIcon} alt="Cafe Icon" className="showingFacBtn-iconImage" /></button>카페</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('store')}><img src={Icons.storeIcon} alt="Store Icon" className="showingFacBtn-iconImage" /></button>편의점</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('cafeteria')}><img src={Icons.cafeteriaIcon} alt="Cafeteria Icon" className="showingFacBtn-iconImage" /></button>학생식당</div>
                                </div>
                                <div className='showingFacBtn-category'><div className='showingFacBtnText'>업무</div>
                                    <div className='showingFacBtnT' style={{fontSize:'11px'}}><button className='showingFacBtn' onClick={() => handleShowReq('unmanned civil service')}><img src={Icons.unmannedIcon} alt="Unmanned Icon" className="showingFacBtn-iconImage"/></button>무인민원발급기</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('print')}><img src={Icons.printIcon} alt="Print Icon" className="showingFacBtn-iconImage" /></button>복사실</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('postoffice')}><img src={Icons.postOfficeIcon} alt="Post Office Icon" className="showingFacBtn-iconImage" /></button>우체국</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('atm')}><img src={Icons.atmIcon} alt="ATM Icon" className="showingFacBtn-iconImage" /></button>은행/ATM</div>
                                </div>
                                <div className='showingFacBtn-category'><div className='showingFacBtnText'>학업</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('library')}><img src={Icons.libraryIcon} alt="library Icon" className="showingFacBtn-iconImage" /></button>도서관</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('healthservice')}><img src={Icons.healthServiceIcon} alt="Health Service Icon" className="showingFacBtn-iconImage" /></button>보건소</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('book store')}><img src={Icons.bookstoreIcon} alt="bookstore Icon" className="showingFacBtn-iconImage" /></button>서점/문구</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('seminarroom')}><img src={Icons.seminarRoomIcon} alt="Seminar Room Icon" className="showingFacBtn-iconImage" /></button>세미나실</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('lounge')}><img src={Icons.loungeIcon} alt="Lounge Icon" className="showingFacBtn-iconImage" /></button>학생라운지</div>
                                </div>
                                <div className='showingFacBtn-category'><div className='showingFacBtnText'>휴식</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('bench')}><img src={Icons.benchIcon} alt="Bench Icon" className="showingFacBtn-iconImage" /></button>벤치</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('shower room')}><img src={Icons.showerRoomIcon} alt="Shower Room Icon" className="showingFacBtn-iconImage" /></button>샤워실</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('vendingMachine')}><img src={Icons.vendingMachineIcon} alt="vendingMachineIcon" className="showingFacBtn-iconImage" /></button>자판기</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('breakroom')}><img src={Icons.breakRoomIcon} alt="Break Room Icon" className="showingFacBtn-iconImage" /></button>휴게실</div>
                                </div>
                                <div className='showingFacBtn-category'><div className='showingFacBtnText'> 야외</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('rooftop garden')}><img src={Icons.rooftopIcon} alt="Rooftop Icon" className="showingFacBtn-iconImage" /></button>옥상정원</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('Sbicycle')}><img src={Icons.sBicycleIcon} alt="S-Bicycle Icon" className="showingFacBtn-iconImage" /></button>따릉이 대여소</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('bicycle')}><img src={Icons.bicycleIcon} alt="Bicycle Icon" className="showingFacBtn-iconImage" /></button>자전거 거치대</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('parking')}><img src={Icons.parkingIcon} alt="Parking Icon" className="showingFacBtn-iconImage" /></button>주차장</div>
                                    <div className='showingFacBtnT'><button className='showingFacBtn' onClick={() => handleShowReq('smoking')}><img src={Icons.smokingIcon} alt="Smoking Icon" className="showingFacBtn-iconImage" /></button>흡연구역</div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>}
                {activeTab === '길찾기' && (
                    <div>
                        <div className="pathfinder-page">
                            {BarrierFreeMode && (
                                <div style={{borderStyle: 'solid', borderColor: '#FFCD4A', margin:'0 7px 5px 7px'}}>
                                    <div style={{fontSize: '15px', textAlign: 'center',margin: '5px 0 5px 0', fontFamily: 'Pretendard-Regular'}}>길찾기 경로 옵션</div>
                                    <div className="option-button-row">
                                        <button className='option-toggle-btn' onClick={handleToggleObstacleMenu}><img src={Icons.settingsIcon} alt="Setting Icon" className="iconImage" style={{width: '25px', height: '25px'}}/></button>
                                        <button className={`option-button ${features.unpaved ? 'selected-button' : ''}`} onClick={() => toggleFeature('unpaved')} ><div className='option-buttonT'><img src={Icons.unpavedIcon} alt="NO Unpaved Icon" className="iconImage"/>비포장도로<br></br>제외</div></button>
                                        <button className={`option-button ${features.stairs ? 'selected-button' : ''}`} onClick={() => toggleFeature('stairs')}><div className='option-buttonT'><img src={Icons.stairsIcon} alt="NO Stairs Icon" className="iconImage"/>계단<br></br>제외</div></button>
                                        <button className={`option-button ${features.slope ? 'selected-button' : ''}`} onClick={() => toggleFeature('slope')}><div className='option-buttonT'><img src={Icons.slopeIcon} alt="No Slope Icon" className="iconImage"/>경사로<br></br>제외</div></button>
                                        <button className={`option-button ${features.bump ? 'selected-button' : ''}`} onClick={() => toggleFeature('bump')}><div className='option-buttonT'><img src={Icons.bumpIcon} alt="No bump Icon" className="iconImage"/>도로턱<br></br>제외</div></button>
                                        <button className={`option-button ${features.bol ? 'selected-button' : ''}`} onClick={() => toggleFeature('bol')}><div className='option-buttonT'><img src={Icons.bolIcon} alt="No Bol Icon" className="iconImage"/>볼라드<br></br>제외</div></button>
                                    </div>
                                    {showObstacleMenu && (
                                        <div className='user-obs-option-setting'>
                                            <div className="slidecontainer">
                                                <div className="slider-row">
                                                    1°
                                                    <input className='slider' type="range" min="1" max="6.00" step="0.001" value={slopeD} onChange={handleChange} placeholder="임계값"/>
                                                    6°
                                                </div>
                                                <div className='option-setting'> 경사각도
                                                    <input className='slider-result' type="text" placeholder="임계값" value={slopeD} onChange={(e) => setSlopeD(e.target.value)}/>
                                                    [°] ( 기울기: {(slopeD*3.14/180*100).toFixed(2)}%) 이상 제외
                                                </div>
                                            </div>
                                            <div className="slidecontainer">
                                                <div className="slider-row">
                                                    40cm
                                                    <input className='slider' type="range" min="40" max="150" value={bolC} onChange={(e) => setBolC(e.target.value)} placeholder="임계값"/>
                                                    150cm
                                                </div>
                                                <div className='option-setting'> 볼라드 간격
                                                    <input className='slider-result' type="text" placeholder="임계값" value={bolC} onChange={(e) => setBolC(e.target.value)}/>
                                                    [cm] 이하 제외
                                                </div>
                                            </div>
                                            <div className="slidecontainer">
                                                <div className="slider-row">
                                                    1.0cm
                                                    <input className='slider' type="range" min="1" max="8" step="0.10" value={bumpC} onChange={(e) => setBumpC(e.target.value)} placeholder="임계값"/>
                                                    8.0cm
                                                </div>
                                                <div className='option-setting'> 도로턱 높이
                                                    <input className='slider-result' type="text" placeholder="임계값" value={bumpC} onChange={(e) => setBumpC(e.target.value)}/>
                                                    [cm] 이상 제외
                                                </div>
                                            </div>
                                            <div style={{fontSize: '13px'}}>* 초기값 ( <strong>경사도: 3.18°, 볼라드 간격: 120cm, 도로턱 높이: 2cm</strong> )<br/> 출처: 장애인·노인·임산부 등의 편의증진보장에 관한 법률 시행규칙</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="input-row">
                                <div className="input">
                                    <img src={irumarkerS} alt="start irumarker" className="irumarkerImage" />
                                    <div className="input-box">
                                        <input className='pf-input-style' type="text" placeholder="출발지를 입력하세요" value={start} onChange={(e) => setStart(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    {!(stopovers.length>STOPOVER_MAX_INDEX) && stopovers.map((stopover, index) => (
                                        <div className="input" key={index}>
                                            <img src={irumarkerG} alt="stopover irumarker" className="irumarkerImage"/>
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
                            </div>
                            {obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0 && (
                                <div className="button-row">
                                    <button className="button-style" onClick={() => {handleInputReset();    initialObsState();}}>⟲ 다시입력</button>
                                    <button className="button-style" onClick={() => {initLegend(); handleFindPathClick(); initialObsState();}}>길찾기 결과 보기</button>
                                </div>
                            )}
                            {showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                                <div>
                                    <div className="shortest-path-text">
                                        [최단 경로]
                                        <div>
                                            <div id="total-distance">총 거리: <strong>{totalDistance.toFixed(2)}</strong> m  (예상 시간: 약  <strong> {(totalDistance / 64).toFixed(0)}</strong>분, <strong>{(totalDistance / 0.64).toFixed(0)}</strong>걸음)</div>
                                        </div>
                                    </div>
                                    {BarrierFreeMode && obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0 &&(
                                        <div>
                                            <button className="button-style" style={{marginLeft:'7px'}} onClick={handleShowObsOnPath}>경로 내 장애물 표시</button>
                                        </div>
                                    )}
                                </div>
                            )}
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
                            {BarrierFreeMode && showObsOnPath && showShortestPathText && pathData && totalDistance !== null && totalDistance !== 0 &&(
                                <div className="legend">
                                    <div className="legend-individual"><img src={legend_sidewalk} alt="link_legend_sidewalk" className="legend-img"/>보도</div>
                                    <div className="legend-individual"><img src={legend_mixed} alt="link_legend_mixed" className="legend-img"/>보차혼용</div>
                                    <div className="legend-individual"><img src={legend_crosswalk} alt="link_legend_crosswalk" className="legend-img"/>횡단보도</div>
                                    <div className="legend-individual"><img src={legend_wheelchair} alt="link_legend_wheelchair" className="legend-img"/>휠체어진입로</div>
                                    {legendState.unpaved && <div className="legend-individual"><img src={legend_unpaved} alt="link_legend_unpaved" className="legend-img"/>비포장도로</div>}
                                    {legendState.stair && <div className="legend-individual"><img src={legend_stair} alt="link_legend_stair" className="legend-img"/>계단</div>}
                                    {legendState.slope && <div className="legend-individual"><img src={legend_slope} alt="link_legend_slope" className="legend-img"/>경사로</div>}
                                    {legendState.indoor && <div className="legend-individual"><img src={legend_in} alt="link_legend_in" className="legend-img"/>실내</div>}
                                </div>
                            )}
                        </div>
                        {showShortestPathText && StartEndNormalCheckMessage==='' && totalDistance !== null && totalDistance === 0 && (
                            <div>
                                <div className="warning-result-text">조건에 맞는 경로를 확인할 수 없습니다.<br></br>조건을 바꿔 검색해주세요</div>
                                {BarrierFreeMode && !(obstacleIDs.ObstacleNodeIDs.length === 0 && obstacleIDs.ObstacleLinkIDs.length === 0) && (
                                    <div className="button-row">
                                        <button className="button-style" onClick={() => {handleInputReset(); initialObsState();}}>⟲ 다시입력</button>
                                        <button className="button-style" onClick={() => {handleFindPathClick().then(r => handleShowObsOnPath()); initialObsState(); }}>경로 재검색</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {StartEndNormalCheckMessage!=='' && (
                            <div>
                                <div className="warning-result-text"> {StartEndNormalCheckMessage}</div>
                                <div className="button-row">
                                    <button className="button-style" onClick={() => {handleFindPathClick().then(r => handleShowObsOnPath()); initialObsState(); }}>경로 재검색</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}
            <div className='main-right-side'>
                <button className='ToggleLeftSideBtn' onClick={() => {handleToggleLeftSide();}}>{toggleLeftSideFeature}</button>
                {activeTab === '' && <Map width='100%' height='100vh' keyword={poiKeyword} category={showReqIdsNtype}/>}
                {activeTab === '길찾기'
                && <Map width='100%' height='100vh' pathData={pathData} bol={bol} bump={bump} slopeD={slopeD}
                showObs={showObsOnPath} setShowObs = {setShowObsOnPath} onObstacleAvoidance={handleObstacleAvoidance}/>}
            </div>
        </div>
    );
};

export default App;
