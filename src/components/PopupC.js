//PopupC.js

import {useEffect, useState, useRef } from 'react';
import Overlay from 'ol/Overlay';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

import {showMarkerStyle, clickedLinkStyle} from './MarkerStyle'
import './MapC.css';

const setPopupSelect = (layer, map) => {
    const select = new Select({
        condition: click,
        layers: layer,
        hitTolerance: 20,
    });
    map.addInteraction(select)
    return select;
}

const getIdOf = (feature, category) => {
    let id = ''
    switch (category.type) {
        case 'unpaved':
        case 'stairs':
        case 'slope':
            id = 'id'
            break;
        default:
            id = 'node_id'
    }
    return category.data.ids.indexOf(feature.get(id));
}

export const usePopup = (category, map, layer) => {
    let [image, setImage] = useState('');
    let [content, setContent] = useState('');
    let [ObstacleID, setObstacleID] = useState('');
    let [popupOverlay, setOverlay] = useState('');
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const closerRef = useRef(null);
    let clicked = false;

    const deletePopup = () =>{
        map.getOverlays().getArray()[0].setPosition(undefined); // 아이콘 클릭할 때마다 overlay 생성되는데 가장 최근 팝업이 overlay[0]임
        closerRef.current.blur();
    }
    const setInfoPagePopup = (index) => {
        setImage(category.data.images[index]);
        setContent(category.data.info[index]);
    }
    const setPathFinderPagePopup = (feature) => {
        let bumpExist = layer[0].getSource().getFeatures().includes(feature)
        let bolExist = layer[1].getSource().getFeatures().includes(feature)
        let linkExist = layer[2].getSource().getFeatures().includes(feature)
        if (bumpExist) {
            setImage(feature.get('image_nobs'))
            setContent('도로턱 높이[cm] <br>'+feature.get('bump_hei'))
        } else if (bolExist) {
            setImage(feature.get('image_nobs'))
            setContent('볼라드 간격[cm] <br>'+feature.get('bol_width'))
        } else {    // linkExist
            setImage(feature.get('image_lobs'))
            setContent('경사도[degree] <br>'+feature.get('grad_deg'))
        }
    }

    useEffect(() => {
        // 편의시설 및 장애물 팝업용 overlay 생성
        popupOverlay = new Overlay({
            element: containerRef.current,
            positioning: 'bottom-left',
            autoPan: {
                animation: {
                    duration: 250
                }
            }
        });
        // 클릭 가능한 객체 생성 및 대상 레이어 선정
        const select4Popup = setPopupSelect(layer, map)
        // 클릭 이벤트
        select4Popup.on('select', (event) => {
            const features = event.selected;
            const feature = features[0];
            if (feature){
                if(feature.getId().includes('link')){ // link인 경우
                    feature.setStyle(clickedLinkStyle); // 1. 클릭 시 스타일 바꾸기
                }
                // map.on 이벤트는 이벤트 발생 위치를 좌표로 넣을 수 있는데 select는 안 됨
                //const coordinate = geom.getCoordinates() 도 가능
                const [ minX, minY, maxX, maxY ] = feature.getGeometry().getExtent();
                const coordinate = [ (maxX + minX) / 2, (maxY + minY) / 2 ] // 2. 팝업 뜨는 위치를 위한 좌표 설정
                popupOverlay.setPosition(coordinate); // 3. 팝업 뜨는 위치 설정

                // 4. 팝업 컨텐츠 세팅
                if(category.type === 'allObs') {
                    setPathFinderPagePopup(feature);
                } else {
                    setInfoPagePopup(getIdOf(feature, category))
                }
                setObstacleID(feature.id_); // node.1574 이런식의 구조.
                map.addOverlay(popupOverlay) // 5. 팝업 띄우기
            }
        });

        return () => { // clean-up
            map.removeInteraction(select4Popup);
            let overlayLength = map.getOverlays().getArray().length;
            if (overlayLength > 0) {
                for (let i=0; i<overlayLength; i++) { // INFO 레이어 바뀔 때마다 생성되어있던 overlay 일괄 삭제
                    map.removeOverlay(popupOverlay)
                }
            }
        }
    }, [layer])

    return {image, content, ObstacleID: ObstacleID, containerRef, contentRef, closerRef, deletePopup};
}

export const PopupUIComponent = ({category, map, layer, onPath, onObstacleAvoidance}) => { //onPath: 길찾기 장애물 결과 보여주는 팝업인지 확인하는 불값
    let type = category.type;
    const {image, content,ObstacleID, containerRef, contentRef, closerRef, deletePopup} = usePopup(category, map, layer);

    const handleObstacleAvoidance = () => {
        // "해당 장애물 회피" 버튼 클릭 시 실행되는 함수
        // ObstacleID를 콜백 함수를 통해 App.js로 전달
        onObstacleAvoidance(ObstacleID);
    };

    return (
        <div ref={containerRef} className="ol-popup">
          {<button ref={closerRef} className="ol-popup-closer" onClick={() => deletePopup()}>X</button>}
          <div>{ObstacleID}</div>
          {image && <img src={image} alt="Popup Image" style={{ width: '180px', height: '150px', display: 'block'}}/>}
          <div ref={contentRef} className="ol-popup-content">
            {(type === 'unpaved' || type === 'stairs' || type === 'slope') && <>경사도[degree]</>}
            {type === 'bump' && <>도로턱 높이[cm]</>}
            {type === 'bol' && <>볼라드 간격[cm]</>}
            <div dangerouslySetInnerHTML={{__html: content}} />
          </div>
            {onPath && (
                <div>
                    <button className="individual-obstacles-button" onClick={handleObstacleAvoidance}>해당 장애물 회피</button>
                </div>
            )}
        </div>
    );
};

