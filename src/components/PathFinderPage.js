import React, { useState } from 'react';
import SLogo from './images/SLogo.png';
import uosEmblem from './images/uosEmblem.png';
import irumarker from './images/irumarker.png';
import legend from './images/legend.png';
import MapC from './MapC.js';
import { Link } from "react-router-dom";
import axios from 'axios';

const PathFinderPage = () => {
    const initialFeaturesState = {
        unpaved: false,
        stairs: false,
        slope: false,
        bump: false,
        bol: false,
    };
    const [features, setFeatures] = useState(initialFeaturesState);

    const toggleFeature = (feature) => {
        setFeatures({ ...features, [feature]: !features[feature] });
    };
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [stopovers, setStopovers] = useState([]); // 배열로 경유지 목록 관리

    const [showShortestPathText, setShowShortestPathText] = useState(false);
    const [totalDistance, setTotalDistance] = useState(0);

    const [pathData, setPathData] = useState(null);

    const handlePathResult = (data) => {
        // 응답 데이터에서 총 거리 추출
        console.log(data.minAggCost);
        const calculatedTotalDistance = data.minAggCost;

        // 총 거리를 UI에 업데이트
        setTotalDistance(calculatedTotalDistance);

        // 최단 경로 텍스트를 보이도록 상태를 설정
        setShowShortestPathText(true);
        const shortestPath = data.shortestPath;

        if (shortestPath) {
            setPathData(shortestPath);
        }
    };

    const handleFindPathClick = async () => {
        try {
            // 필요한 데이터 추출
            const requestData = {
                start,
                end,
                stopovers,
                features,
            };
            console.log('중간점검용:',requestData );
            try {
                var response = await axios.post('http://localhost:5000/findPathServer', requestData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                handlePathResult(response.data);
            } catch (error) {
                // 오류 처리
                console.error('Error during Axios POST request', error);
            }
        } catch (error) {
            console.error('Error finding path:', error);
        }
    };
    const addStopover = () => {
        // "경유지 추가" 버튼을 누르면 경유지 목록에 빈 문자열을 추가
        setStopovers([...stopovers, '']);
    };
    const handleStopoverChange = (index, value) => {
        // 경유지 텍스트박스 값이 변경될 때 호출되는 함수
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

    return (
        <main>
            <div className="pathfinder-page">
                <div className="left-sidebar">
                    <div className="sidebar-item">
                        <Link to="/">
                            <img src={SLogo} alt="SㅣnerGY FLogo" style={{ width: '40px', display: 'block', margin: '0 auto' }} />
                        </Link>
                    </div>
                    <div className="sidebar-item active">
                        <img src={irumarker} alt="SㅣnerGY FLogo" style={{ width: '18px', display: 'block', margin: '0 auto' }} />
                        <span style={{ color: '#0bb28c', fontSize: '13px', textAlign: 'center', display: 'block'}}>길찾기</span>
                    </div>
                    <div className="sidebar-item">
                        <Link to="https://portal.uos.ac.kr/user/login.face">
                            <img src={uosEmblem} alt="SㅣnerGY FLogo" style={{ width: '40px', display: 'block', margin: '0 auto' }} />
                        </Link>
                        <span style={{ color: 'navy', fontSize: '13px', textAlign: 'center', display: 'block'}}>학교 포털</span>
                    </div>
                    <div className="sidebar-item">
                        <Link to="https://www.uos.ac.kr/korNotice/list.do?list_id=FA1" style={{ color: 'navy', fontSize: '17px', textAlign: 'center', display: 'block'}}>event</Link>
                    </div>
                </div>
                <div className="middle-content">
                    <div className="button-row">
                        <button style={{ marginLeft: '5px', height: '40px', fontSize: '13px',backgroundColor: features.unpaved ? 'red' : 'initial',}} onClick={() => toggleFeature('unpaved')}>비포장 도로<br />X</button>
                        <button style={{ height: '40px', fontSize: '13px', backgroundColor: features.stairs ? 'red' : 'initial'}} onClick={() => toggleFeature('stairs')}>계 단<br />X</button>
                        <button style={{ height: '40px', fontSize: '13px', backgroundColor: features.slope ? 'red' : 'initial'}} onClick={() => toggleFeature('slope')}>경 사 로<br />X</button>
                        <button style={{ height: '40px', fontSize: '13px', backgroundColor: features.bump ? 'red' : 'initial'}} onClick={() => toggleFeature('bump')}>도 로 턱<br />X</button>
                        <button style={{ height: '40px', marginRight: '5px', fontSize: '13px', backgroundColor: features.bol ? 'red' : 'initial'}} onClick={() => toggleFeature('bol')}>볼 라 드<br />X</button>
                    </div>

                    <div className="input-row">
                        <input type="text" placeholder="출발지를 입력하세요" style={{ height: '35px', margin: '5px' }} value={start} onChange={(e) => setStart(e.target.value)} />
                        <div className="add-more-oil">
                            <button onClick={addStopover} style={{ height: '35px', margin: '5px' }}>경유지 추가</button>
                            <div className="stopover-textboxes">
                                {stopovers.map((stopover, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        placeholder={`${index + 1}번째 경유지`}
                                        style={{ height: '30px', margin: '5px' }}
                                        value={stopover}
                                        onChange={(e) => handleStopoverChange(index, e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>
                        <input type="text" placeholder="도착지를 입력하세요" style={{ height: '35px', margin: '5px' }} value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>
                    <div className="button-row">
                        <button className="button-style" onClick={handleInputReset}>입력 초기화</button>
                        <button className="button-style" onClick={handleFindPathClick}>길찾기 결과 보기</button>
                    </div>
                    {/* 상태가 true일 때만 최단 경로 텍스트를 보여줍니다 */}
                    {showShortestPathText && (
                        <div>
                            {/* 최단 경로 텍스트 및 마크 옵션 표시 */}
                            <div className="shortest-path-text">
                                <br />
                                최단 경로 검색 결과: <br />
                                <br />
                                <div id="total-distance"style={{ marginLeft: '40px' }}>총 거리:  {totalDistance.toFixed(4)} m</div>
                                <img src={legend} alt="link_legend" style={{ width: '70%', display: 'block', margin: '0 auto' }} />
                            </div>
                            {/* 
                            <div className="mark-options">
                                
                                {!features.unpaved && (
                                    <button style={{ height: '38px', fontSize: '18px' }}>경로 내 비포장도로 표시하기</button>
                                )}
                                {!features.stairs && (
                                    <button style={{ height: '38px', fontSize: '18px' }}>경로 내 계단 위치 표시하기</button>
                                )}
                                {!features.slope && (
                                    <button style={{ height: '38px', fontSize: '18px' }}>경로 내 경사로 표시하기</button>
                                )}
                                {!features.bump && (
                                    <button style={{ height: '38px', fontSize: '18px' }}>경로 내 도로턱 표시하기</button>
                                )}
                                {!features.bol && (
                                    <button style={{ height: '38px', fontSize: '18px' }}>경로 내 볼라드 표시하기</button>
                                )}
                                
                            </div>
                            */}
                            {/* 
                            <div className="button-row">
                                <button className="button-style">제외 항목 초기화</button>
                                <button className="button-style">제외한 결과 보기</button>
                            </div>
                            */}
                        </div>
                    )}
                </div>
                <div className="right-content">
                    {/* handlePathResult와 pathData를 Map 컴포넌트로 전달 */}
                    <MapC pathData={pathData} width='100%' height='810px' />
                </div>
            </div>
        </main>
    );
}

export default PathFinderPage;
