//MapC.js
import { useEffect, useState, useRef } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { get as getProjection, fromLonLat } from 'ol/proj';
import makeCrsFilter4node from "./utils/filter-for-node.js";
import {makeCrsFilter, ShowReqFilter} from "./utils/crs-filter.js";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Stroke, Style, Icon} from "ol/style";
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import Select from 'ol/interaction/Select';
import { click, pointerMove } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import './MapC.css';

import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/Irumaker2.png';

import facilitiesIcon from './images/icons/facilitiesIcon.png';
import bumpIcon from './images/icons/bumpIcon.png';
import bolIcon from './images/icons/bolIcon.png';
import unpavedIcon from './images/icons/unpavedIcon.png';
import stairsIcon from './images/icons/stairsIcon.png';
import slopeIcon from './images/icons/slopeIcon.png';
import benchIcon from './images/icons/benchIcon.png';
import atmIcon from './images/icons/atmIcon.png';
import bicycleIcon from './images/icons/bicycleIcon.png';
import smokingIcon from './images/icons/smokingIcon.png';

const VWorldBaseUrl = 'https://api.vworld.kr/req/wmts/1.0.0/288AB3D7-7900-3465-BC2F-66917AB18D55';

const osmLayer = new TileLayer({
    source: new OSM({ attributions: '', cacheSize: 0 }),
    properties: { name: 'base-osm' },
    //zIndex: 1,
    //preload: Infinity,
});

const vworldBaseLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Base/{z}/{y}/{x}.png` }),
    properties: { name: 'base-vworld-base' },
    minZoom: 16,
    maxZoom: 22,
    //zIndex: 2,
    //preload: Infinity,
});

const vworldSatelliteLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Satellite/{z}/{y}/{x}.jpeg` }),
    properties: { name: 'base-vworld-satellite' },
    minZoom: 15,
    maxZoom: 22,
    //preload: Infinity,
});

const UOSbasemapTile = new TileLayer({
    title: 'UOS Base Map',
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/gp/wms',
        params: { 'LAYERS': 'gp:basemap' },
        serverType: 'geoserver',
    }),
});

const UOSorthoTile = new TileLayer({
        title: 'UOS Road',
        visible: true,
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:uos_orthomosaic' },
            serverType: 'geoserver',
        }),
        zIndex: 1
    });

const basicMarkerStyle = (irumarker) => { //출발지 스타일
    return new Style({
        image: new Icon({
            src: irumarker,
            scale: 0.1, // 이미지의 크기
            opacity: 1, // 이미지의 투명도
            rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부
            rotation: 0 // 이미지의 초기 회전 각도
        })
    });
};

const clickedMarkerStyle = (irumarker) => {
  return new Style({
      image: new Icon({
          src: irumarker, // 이미지 파일의 경로를 설정합니다.
          scale: 0.1, // 이미지의 크기를 조절합니다. 필요에 따라 조절하세요.
          opacity: 0.7, // 이미지의 투명도를 조절합니다.
          rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부를 설정합니다.
          rotation: 0 // 이미지의 초기 회전 각도를 설정합니다.
      })
  });
};

const showMarkerStyle = (markertype) => {
    let markerimg; // markerimg 변수를 함수 스코프 내로 이동하여 전역으로 선언

    if (markertype === 'facilities') { markerimg = facilitiesIcon; }
    else if (markertype === 'bump') { markerimg = bumpIcon; }
    else if (markertype === 'bol') { markerimg = bolIcon; }
    else if (markertype === 'unpaved') { markerimg = unpavedIcon; }
    else if (markertype === 'stairs') { markerimg = stairsIcon; }
    else if (markertype === 'slope') { markerimg = slopeIcon; }
    else if (markertype === 'bench') { markerimg = benchIcon; } // 변수명 수정
    else if (markertype === 'atm') { markerimg = atmIcon; }
    else if (markertype === 'bicycle') { markerimg = bicycleIcon; }
    else if (markertype === 'smoking') { markerimg = smokingIcon; }
    return new Style({
        image: new Icon({
            src: markerimg,
            scale: 0.07,
            opacity: 0.7,
            rotateWithView: false,
            rotation: 0
        })
    });
};



const makelocaArrayFromNodes = (pathData, locaArray) => {
    pathData.forEach((path, index) => {
        const listOfNodeId = path.map(n => n.node); // 주의: 출발지의 start_vid, 도착지의 end_vid는 빼고 node가 다 2개씩 있음
        locaArray.push(listOfNodeId[0]);
        if (index === pathData.length - 1) {
            locaArray.push(listOfNodeId[listOfNodeId.length - 1]);
        }
    });
    return locaArray;
}

const setMarkerSrcOf = (locaArray,index) => {
    if (index === 0) { // 출발지
        return irumarkerS;
    } else if (index === locaArray.length - 1) { //도착지
        return irumarkerE;
    } else {
        return irumarker2; // 경유지
    }
}

const poiMarkerClickEventWith = (keyword, selectClick) => {
    // feature를 선택할 때 이벤트
    selectClick.on('select', function(e) {
        var selectedFeatures = e.selected;

        selectedFeatures.forEach(function(feature) {
            if (feature.get('bg_name') === keyword) {
                feature.setStyle(clickedMarkerStyle(irumarker2))
                console.log(keyword + ' click')
            }
        });
    });
}

const createPoiMarkerLayer = (cqlFilter) => {
    const poiSource = new VectorSource({ // feature들이 담겨있는 vector source
        format: new GeoJSON({
            dataProjection: 'EPSG:5181'
        }),
        url: function(extent) {
            return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                '&request=GetFeature&typeName=gp%3Apoi_point&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='+cqlFilter;
        },
        serverType: 'geoserver'
    });

    // poiLayer -> poiMarkerLayer (이름 변경)
    const poiMarkerLayer = new VectorLayer({
        title: 'POI',
        visible: true,
        source: poiSource,
        style: basicMarkerStyle(irumarker2),
        zIndex: 4
    });

    return poiMarkerLayer;
}

const createUrl4WFS = (ShowReqIdsNtype) => {
    if (ShowReqIdsNtype.type === 'facilities'|| ShowReqIdsNtype.type === 'bump' || ShowReqIdsNtype.type === 'bol'){
        return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                  '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
                  +ShowReqIdsNtype.Ids +')';
    }
    else if (ShowReqIdsNtype.type === 'unpaved' || ShowReqIdsNtype.type === 'stairs' || ShowReqIdsNtype.type === 'slope'){
        return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                  '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=id in ('
                  +ShowReqIdsNtype.Ids + ')';
    }
    else if (ShowReqIdsNtype.type == 'atm' || ShowReqIdsNtype.type == 'bench' || ShowReqIdsNtype.type == 'bicycle' || ShowReqIdsNtype.type == 'smoking'){
        return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
            '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
            +ShowReqIdsNtype.Ids +')';
    }
}

const createShowLayer = (ShowReqIdsNtype) => {
    const showLayer = new VectorLayer({
            title: `ShowReqIds Layer`, // 편의시설, 도로턱, 볼라드의 노드Id 배열을 가시화
            visible: true,
            source: new VectorSource({
                format: new GeoJSON({
                    dataProjection: 'EPSG:5181'
                }),
                url: function (extent) {
                    return createUrl4WFS(ShowReqIdsNtype)
                },
                serverType: 'geoserver'
            }),
            zIndex: 5,
            style: showMarkerStyle(ShowReqIdsNtype.type),
    });
    return showLayer
}

const MapC = ({ pathData, width, height, keyword, setKeyword, ShowReqIdsNtype, /*markerClicked, setMarkerClicked*/ }) => {
    const [map, setMap] = useState(null);
    const [layerState, setLayerState] = useState('base-osm');
    const popupContainerRef = useRef(null);
    const popupContentRef = useRef(null);
    const popupCloserRef = useRef(null);

    const createShortestPathLayer = (pathData) => {
        pathData.forEach((path, index) => {
            const listOfEdgeId = path.map(e => e.edge);
            const crsFilter = makeCrsFilter(listOfEdgeId);
            // makeShortestPathLayer // 경로 지도레이어
            const shortestPathLayer = new TileLayer({
                title: `UOS Shortest Path ${index + 1}`,
                source: new TileWMS({
                    url: 'http://localhost:8080/geoserver/gp/wms',
                    params: { 'LAYERS': 'gp:link', ...crsFilter },
                    serverType: 'geoserver',
                    visible: true,
                    }),
                zIndex: 2
            });
            map.addLayer(shortestPathLayer);
        })
    }

    const createNAddNodeLayersFrom = (locaArray) => {
        let nodeLayers = [];
        locaArray.forEach((nodeId, index) => {
            // shortestPathLayer->nodeLayer
            const nodeLayer = new VectorLayer({
                title: `Marker ${index + 1}`,
                visible: true,
                source: new VectorSource({ // feature들이 담겨있는 vector source
                    format: new GeoJSON({
                        dataProjection: 'EPSG:5181'
                    }),
                    url: function(extent) { // WMS방식에서 WFS로 변경
                        return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                            '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id='+nodeId;
                    },
                    serverType: 'geoserver'
                }),
                style: basicMarkerStyle(setMarkerSrcOf(locaArray,index)),
                zIndex: 5
            });
            nodeLayers.push(nodeLayer);
            map.addLayer(nodeLayer);
        });
        return nodeLayers;
    }
    const markerClickEventWith = (locaArray, selectClick) => {
        // feature를 선택할 때 이벤트
        selectClick.on('select', function(e) {
            var selectedFeatures = e.selected;

            selectedFeatures.forEach(function(feature) {

                if (feature.get('node_id')==locaArray[0]) {
                    feature.setStyle(clickedMarkerStyle(irumarkerS))
                    console.log('출발지 click: '+feature.getId());
                    //setMarkerClicked(false);
                } else if (feature.get('node_id')==locaArray[locaArray.length-1]){
                    feature.setStyle(clickedMarkerStyle(irumarkerE))
                    console.log('도착지 click: '+feature.getId());
                } else {
                    feature.setStyle(clickedMarkerStyle(irumarker2))
                    console.log('경유지 click: '+feature.getId());
                }
                //setKeyword(feature.get('bulid_name'));
            });
            /*else { // false
                console.log('클릭 후 markerClicked ' + markerClicked)

                selectedFeatures.forEach(function(feature) {
                    setKeyword(feature.get('bulid_name'));
                    if (feature.get('node_id')==locaArray[0]) {
                        feature.setStyle(basicMarkerStyle(irumarkerS))
                        setMarkerClicked(true);
                    } else if (feature.get('node_id')==locaArray[locaArray.length-1]){
                        feature.setStyle(basicMarkerStyle(irumarkerE))
                        setMarkerClicked(true);
                    } else {
                        feature.setStyle(basicMarkerStyle(irumarker2))
                        setMarkerClicked(true);
                    }
                });
            }*/
        });
    }
     const deletePopup = () =>{
        console.log('click')
        const popupCloser = popupCloserRef.current;
        console.log(map.getOverlays().getArray()[0].getPosition())
        map.getOverlays().getArray()[0].setPosition(undefined);
        console.log(map.getOverlays().getArray()[0].getPosition())
        popupCloser.blur();
        return false;
    }
		//추가부분
    proj4.defs('EPSG:5181', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs');
    register(proj4);

    useEffect(() => {
        const view = new View({
            //projection: getProjection('EPSG:5181'),
            center: fromLonLat([127.0596, 37.5837]),
            zoom: 17,
            minZoom: 16,
            maxZoom: 22,
        });

        const newMap = new Map({
            layers: [osmLayer],
            target: 'map',
            view: view,
        });

        setMap(newMap);

        return () => {
            newMap.setTarget(null);
        };
    }, []);

    useEffect(() => {
        if (map) {
            console.log('-------rendering------')
            const layerExists = map.getLayers();
            // 배경지도 옵션 설정
            if (layerExists) {
                switch (layerState) {
                    case 'base-base':
                        map.getLayers().clear();
                        map.addLayer(vworldBaseLayer);
                        map.addLayer(UOSbasemapTile);
                        break;
                    case 'base-satellite':
                        map.getLayers().clear();
                        map.addLayer(vworldSatelliteLayer);
                        map.addLayer(UOSorthoTile);
                        console.log('항공');
                        break;
                    default:
                        map.getLayers().clear();
                        map.addLayer(osmLayer);
                        break;
                }
            }

            var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열

            // 출발지 도착지 다 분홍색 노드로 보여줬던 부분. 링크 추출
            if (pathData && pathData.length >= 1) { // 경로를 이루는 간선이 하나라도 존재를 하면
                createShortestPathLayer(pathData);
                locaArray = makelocaArrayFromNodes(pathData,locaArray); // pathData 가공해서 locaArray 도출

                //console.log(locaArray);
            }
            // 출발, 도착, 경유 노드 표시
            if (locaArray && locaArray.length >= 2) {
                let selectSingleClick = new Select({ //feature 클릭 가능한 select 객체
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: createNAddNodeLayersFrom(locaArray)
                });
                map.addInteraction(selectSingleClick);
                markerClickEventWith(locaArray, selectSingleClick); // 노드 마커 클릭 이벤트
            }

            if (keyword) {
                let cqlFilter = encodeURIComponent("name like '%"+keyword+"%'" + "or nickname like '%"+keyword+"%'" + "or eng_name like '%"+keyword+"%'"); // Replace 'desiredName' with the name you want to filter by

                const poiMarkerLayer = createPoiMarkerLayer(cqlFilter)
                map.addLayer(poiMarkerLayer)

                let selectBuildClick = new Select({
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: [poiMarkerLayer]
                });
                map.addInteraction(selectBuildClick);
//                poiMarkerClickEventWith(keyword,selectBuildClick);
            }

            if (ShowReqIdsNtype){
                if (ShowReqIdsNtype.type) {
                    const showLayer = createShowLayer(ShowReqIdsNtype)
                    map.addLayer(showLayer);

                    const content = popupContentRef.current;

                    const popupOverlay = new Overlay({
                        element: popupContainerRef.current,
                        positioning: 'bottom-left',
                        autoPan: {
                            animation: {
                                duration: 250
                            }
                        }
                    });

                    const select4Popup = new Select({
                    condition: click,
                    layers: [showLayer],
                    hitTolerance: 20
                    });
                    map.addInteraction(select4Popup)

                    select4Popup.on('select', (event) => {
                        const features = event.selected;
                        const feature = features[0];

                        if (feature){
                            feature.setStyle(showMarkerStyle(ShowReqIdsNtype.type)); // 1. 클릭 시 스타일 바꾸기

                            // map.on 이벤트는 이벤트 발생 위치를 좌표로 넣을 수 있는데 select는 안 됨
                            const geom = feature.getGeometry();
                            const [ minX, minY, maxX, maxY ] = geom.getExtent();
                            const coordinate = [ (maxX + minX) / 2, (maxY + minY) / 2 ] // 2. 팝업 뜨는 위치를 위한 좌표 설정
                            //const coordinate = geom.getCoordinates()
                            popupOverlay.setPosition(coordinate); // 3. 팝업 뜨는 위치 설정

                            const properties = feature.getProperties();
                            console.log(properties)
                            const info = Object.keys(properties).map(key => `${key}: ${properties[key]}`).join('<br>'); // 정보 가공
                            content.innerHTML = info; // 4. 정보 HTML 형식으로 입력

                            map.addOverlay(popupOverlay) // 5. 팝업 띄우기
                        }
//                        console.log('popupContainer')
//                        console.log(popupContainerRef.current)
                    });
                    map.on('pointermove', (e) => map.getViewport().style.cursor = map.hasFeatureAtPixel(e.pixel) ? 'pointer' : '');

                    return () => {
                        map.removeLayer(showLayer)
                        map.removeInteraction(select4Popup);
                        map.removeOverlay(popupOverlay)
                    }
                }
            }
        }
    }, [map, layerState, pathData, keyword, /*markerClicked, setMarkerClicked,*/ ShowReqIdsNtype]);

    return (
        <div>
            <div className="select-layer-wrap" style={{ position: 'relative' }}>
                <select style={{ position: 'absolute', top: '4px', right: '4px', 'zIndex': '100', fontSize: '15px' }} value={layerState} onChange={(e) => setLayerState(e.target.value)}>
                    <option value='base-osm'>OSM</option>
                    <option value='base-base'>기본지도</option>
                    <option value='base-satellite'>항공영상</option>
                </select>
            </div>
            <div id="map" style={{ width, height }}></div>
            {ShowReqIdsNtype && ShowReqIdsNtype.type && (<div ref={popupContainerRef} className="ol-popup">
              <button ref={popupCloserRef} className="ol-popup-closer" onClick={() => deletePopup()}>X</button>
              <div ref={popupContentRef} className="ol-popup-content">
              </div>
            </div>
            )}
        </div>
    );
};

export default MapC;