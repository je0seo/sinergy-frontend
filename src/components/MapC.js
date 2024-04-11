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

import bumpIcon from './images/icons/bumpIcon.png';
import bolIcon from './images/icons/bolIcon.png';
import unpavedIcon from './images/icons/unpavedIcon.png';
import stairsIcon from './images/icons/stairsIcon.png';
import slopeIcon from './images/icons/slopeIcon.png';
import facilitiesIcon from './images/icons/facilitiesIcon.png';
import benchIcon from './images/icons/benchIcon.png';
import atmIcon from './images/icons/atmIcon.png';
import bicycleIcon from './images/icons/bicycleIcon.png';
import smokingIcon from './images/icons/smokingIcon.png';
import storeIcon from './images/icons/storeIcon.png';
import cafeIcon from './images/icons/cafeIcon.png';
import postOfficeIcon from './images/icons/postOfficeIcon.png';
import healthServiceIcon from './images/icons/healthServiceIcon.png';
import cafeteriaIcon from './images/icons/cafeteriaIcon.png';
import printIcon from './images/icons/printIcon.png';
import gymIcon from './images/icons/gymIcon.png';
import tennisIcon from './images/icons/tennisIcon.png';
import basketballIcon from './images/icons/basketballIcon.png';
import breakRoomIcon from './images/icons/breakRoomIcon.png';
import loungeIcon from './images/icons/loungeIcon.png';
import seminarRoomIcon from './images/icons/seminarRoomIcon.png';
import sBicycleIcon from './images/icons/sBicycleIcon.png';
import vendingMachineIcon from './images/icons/vendingMachineIcon.png';
import libraryIcon from './images/icons/libraryIcon.png';


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
    switch (markertype) {
        case 'facilities': markerimg = facilitiesIcon; break;
        case 'bench': markerimg = benchIcon; break;
        case 'atm': markerimg = atmIcon; break;
        case 'bicycle': markerimg = bicycleIcon; break;
        case 'smoking': markerimg = smokingIcon; break;
        case 'store': markerimg = storeIcon; break;
        case 'cafe': markerimg = cafeIcon; break;
        case 'postoffice': markerimg = postOfficeIcon; break;
        case 'healthservice': markerimg = healthServiceIcon; break;
        case 'cafeteria': markerimg = cafeteriaIcon; break;
        case 'print': markerimg = printIcon; break;
        case 'gym': markerimg = gymIcon; break;
        case 'tennis': markerimg = tennisIcon; break;
        case 'basketball': markerimg = basketballIcon; break;
        case 'breakroom': markerimg = breakRoomIcon; break;
        case 'lounge': markerimg = loungeIcon; break;
        case 'seminarroom': markerimg = seminarRoomIcon; break;
        case 'Sbicycle': markerimg = sBicycleIcon; break;
        case 'library': markerimg = libraryIcon; break;
        case 'vendingMachine': markerimg = vendingMachineIcon; break;
        case 'bump': markerimg = bumpIcon; break;
        case 'bol': markerimg = bolIcon; break;
        case 'unpaved':
            return new Style({
                stroke: new Stroke({
                    color: '#711B6B', // 선의 색상
                    width: 2.5 // 선의 두께
                })
            });
        case 'stairs':
            return new Style({
                stroke: new Stroke({
                    color: '#D03C36', // 선의 색상
                    width: 2.5 // 선의 두께
                })
            });
        case 'slope':
            return new Style({
                stroke: new Stroke({
                    color: '#FC3083', // 선의 색상
                    width: 2.5 // 선의 두께
                })
            });
        default: /* 처리되지 않은 경우 기본값 설정 */ break;
    }
    return new Style({
        image: new Icon({
            src: markerimg,
            scale: 0.03,
            opacity: 1,
            rotateWithView: false,
            rotation: 0
        })
    });
};

const makelocaArrayFromNodes = (pathData, locaArray) => {
    pathData.forEach((path, index) => {
        const listOfNodeId = path.map(n => n.node) // 주의: 출발지의 start_vid, 도착지의 end_vid는 빼고 node가 다 2개씩 있음
        locaArray.push(listOfNodeId[0]);
        if (index === pathData.length - 1) {
            locaArray.push(listOfNodeId[listOfNodeId.length - 1]);
        }
    });
    return locaArray;
}

const getIdsOnPath = (pathData) => {
    let listOfNodeId = [];
    pathData.forEach((path, index) => {
        listOfNodeId = path.map(n => n.node)
    });
    return listOfNodeId
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
     switch (ShowReqIdsNtype.type) {
         case 'unpaved':
         case 'stairs':
         case 'slope':
             return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                  '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=id in ('
                  +ShowReqIdsNtype.data.ids + ')';
         default:
             return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                 '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
                 +ShowReqIdsNtype.data.ids +')';
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

const createObsLayerWith = (obsType, pathNodeIds) => {
    let obsSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: 'EPSG:5181'
        }),
        url: function (extent) {
            return  'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                              '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
                              +obsType.data.ids +') and node_id in (' +pathNodeIds + ')';
        },
        serverType: 'geoserver'
    })
    console.log(obsSource.getFeatures())
    const obsLayer = new VectorLayer({
        title: `ShowObsOnPath Layer`,
        visible: true,
        source: obsSource,
        zIndex: 6,
        style: showMarkerStyle(obsType.type),
    });
    return obsLayer
}

const MapC = ({ pathData, width, height, keyword, setKeyword, ShowReqIdsNtype, bol, bump /*markerClicked, setMarkerClicked*/ }) => {
    const [map, setMap] = useState(null);
    const [layerState, setLayerState] = useState('base-osm');
    const [popupImage, setPopupImage] = useState('');
    const [popupContent, setPopupContent] = useState('');
    const popupContainerRef = useRef(null);
    const popupContentRef = useRef(null);
    const popupCloserRef = useRef(null);

    const createShortestPathLayer = (pathData) => {
        console.log("pathData:", pathData);
        const colorPalette = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'cyan', 'magenta'];

        pathData.forEach((path, index) => {
            const listOfEdgeId = path.map(e => e.edge);
            //console.log("listOfEdgeId:", listOfEdgeId);
            const crsFilter = makeCrsFilter(listOfEdgeId);
            //console.log("crsFilter:", crsFilter);
            const shortestPathLayer = new VectorLayer({
                title: `UOS Shortest Path ${index + 1}`,
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                        '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='+crsFilter
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: colorPalette[index % colorPalette.length],
                        width: 2
                    })
                }),
                zIndex: 2
            });

            map.addLayer(shortestPathLayer);
        });
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
    const setPopupOf = (feature, Type) => {
        let id = ''
        switch (Type.type) {
            case 'unpaved':
            case 'stairs':
            case 'slope':
                id = 'id'
                break;
            default:
                id = 'node_id'
        }
        let idIdx = Type.data.ids.indexOf(feature.get(id));
        setPopupImage(Type.data.images[idIdx]);
        setPopupContent(Type.data.info[idIdx]);
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
                        break;
                    default:
                        map.getLayers().clear();
                        map.addLayer(osmLayer);
                        break;
                }
            }

            var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열
            let pathNodeIds = [];

            // 출발지 도착지 다 분홍색 노드로 보여줬던 부분. 링크 추출
            if (pathData && pathData.length >= 1) { // 경로를 이루는 간선이 하나라도 존재를 하면
                createShortestPathLayer(pathData);
                locaArray = makelocaArrayFromNodes(pathData,locaArray); // pathData 가공해서 locaArray 도출

                pathNodeIds = getIdsOnPath(pathData)
                console.log('pathNodeIds', pathNodeIds)
            }
            // 출발, 도착, 경유 노드 표시
            if (locaArray && locaArray.length >= 2) {
                let selectSingleClick = new Select({ //feature 클릭 가능한 select 객체
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: createNAddNodeLayersFrom(locaArray)
                });
                map.addInteraction(selectSingleClick);
                markerClickEventWith(locaArray, selectSingleClick); // 노드 마커 클릭 이벤트

                if (bump.type) {
                    const obsLayer = createObsLayerWith(bump, pathNodeIds)
                    map. addLayer(obsLayer)

                    return () => {
                        map.removeLayer(obsLayer)
                    }
                }

                if (bol.type) {
                    const obsLayer = createObsLayerWith(bol, pathNodeIds)
                    map. addLayer(obsLayer)

                    return () => {
                        map.removeLayer(obsLayer)
                    }
                }
            }

            if (keyword) {
                // Replace 'desiredName' with the name you want to filter by
                let cqlFilter = encodeURIComponent("name like '%"+keyword+"%'" + "or nickname like '"+keyword+"' or eng_name ILIKE '%"+keyword+"%'");

                const poiMarkerLayer = createPoiMarkerLayer(cqlFilter)
                map.addLayer(poiMarkerLayer)

                let selectBuildClick = new Select({
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: [poiMarkerLayer]
                });
                map.addInteraction(selectBuildClick);
               // poiMarkerClickEventWith(keyword,selectBuildClick);
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

                            setPopupOf(feature, ShowReqIdsNtype)

                            map.addOverlay(popupOverlay) // 5. 팝업 띄우기
                        }
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
    }, [map, layerState, pathData, keyword, /*markerClicked, setMarkerClicked,*/ ShowReqIdsNtype, bump]);

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
              {popupImage && <img src={popupImage} alt="Popup Image" style={{ width: '180px', height: '150px', display: 'block'}}/>}
              <div ref={popupContentRef} className="ol-popup-content">
                {(ShowReqIdsNtype.type === 'unpaved' || ShowReqIdsNtype.type === 'stairs' || ShowReqIdsNtype.type === 'slope') && <>경사도[degree]</>}
                {(ShowReqIdsNtype.type === 'bump' || bump) && <>도로턱 높이[cm]</>}
                {(ShowReqIdsNtype.type === 'bol' || bol) && <>볼라드 간격[cm]</>}
                <div dangerouslySetInnerHTML={{__html: popupContent}} />
              </div>
            </div>
            )}
        </div>
    );
};

export default MapC;