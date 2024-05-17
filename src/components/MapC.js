//MapC.js
import React, { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';
import {makeCrsFilter} from "./utils/crs-filter.js";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Stroke, Style, Text} from "ol/style";
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import {basicMarkerStyle, clickedMarkerStyle, entryMarkerStyle} from './MarkerStyle'

import Select from 'ol/interaction/Select';
import { ScaleLine } from 'ol/control';
import { click, pointerMove } from 'ol/events/condition';

import HandleCategoryClick from './HandleCategoryClick';
import {getNodeIdsOnPath, ShowObsOnPath} from './ShowObsOnPath';

import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/IrumakerG.png';

import layerBase from './images/layer-base.png';
import layerDrone from './images/layer-drone.png';

import axios from 'axios';
import {NODE_BACKEND_URL} from "../constants/urls";

const VWorldBaseUrl = 'https://api.vworld.kr/req/wmts/1.0.0/ABA020A7-DBB7-3954-900F-E891C0E4995E';

const osmLayer = new TileLayer({
    title: 'base-osm',
    source: new OSM({ attributions: '', cacheSize: 0 }),
    properties: { name: 'base-osm' },
    //zIndex: 1,
    //preload: Infinity,
});

const vworldBaseLayer = new TileLayer({
    title: 'base-vworld-base',
    source: new XYZ({ url: `${VWorldBaseUrl}/Base/{z}/{y}/{x}.png` }),
    properties: { name: 'base-vworld-base' },
    minZoom: 16,
    maxZoom: 22,
    //zIndex: 2,
    //preload: Infinity,
});

const vworldSatelliteLayer = new TileLayer({
    title: 'base-vworld-satellite',
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

const basePoiText = new TileLayer({
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/gp/wms',
        params: { 'LAYERS': 'gp:poi_point'}, // 해당 스타일 발행 필요
        serverType: 'geoserver' // 사용 중인 WMS 서버 종류에 따라 설정
    }),
    zIndex: 5
});

const satellitePoiText = new TileLayer({
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/gp/wms',
        params: { 'LAYERS': 'gp:poi_point','STYLES': 'orthomosaic_poi_point'}, // 해당 스타일 발행 필요
        serverType: 'geoserver' // 사용 중인 WMS 서버 종류에 따라 설정
    }),
    zIndex: 5
});

const makelocaArrayFromNodes = (pathData, locaArray) => {
    pathData.forEach((path, index) => {
        const listOfNodeId = path.map(n => n.node) // 주의: 출발지의 start_vid, 도착지의 end_vid는 빼고 node가 다 2개씩 있음
        locaArray.push(listOfNodeId[0]);
        //console.log(listOfNodeId)
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
        style: basicMarkerStyle(irumarkerE),
        zIndex: 6
    });

    return poiMarkerLayer;
}

const createEntryMarkerLayer = (pathNodeIds) => {
    return new VectorLayer({
        title: 'ENTRY',
        visible: true,
        source: new VectorSource({ // feature들이 담겨있는 vector source
            format: new GeoJSON({
                dataProjection: 'EPSG:5181'
            }),
            url: function(extent) {
                return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                    '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id IN ('+pathNodeIds+ ') AND node_att = 2';
            },
            serverType: 'geoserver'
        }),
        style: entryMarkerStyle,
        zIndex: 5
    });
}

const markerClickEventWith = (locaArray, selectClick) => {
    // feature를 선택할 때 이벤트
    selectClick.on('select', function(e) {
        var selectedFeatures = e.selected;

        selectedFeatures.forEach(function(feature) {
            if (feature.get('node_id')==locaArray[0]) {
                feature.setStyle(clickedMarkerStyle(irumarkerS)) // 출발지
            } else if (feature.get('node_id')==locaArray[locaArray.length-1]){
                feature.setStyle(clickedMarkerStyle(irumarkerE)) // 도착지
            } else {
                feature.setStyle(clickedMarkerStyle(irumarker2)) // 경유지
            }
        });
    });
}

const createIndoorLayer = (buildingName, floor) => {
    const cqlFilter = `build_name = '${buildingName}' AND floor = '${floor}'`;

    return new TileLayer({
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:bd_in','CQL_FILTER': cqlFilter, 'STYLES': 'bd_in'}, // bd_in 스타일 발행 필요
            serverType: 'geoserver' // 사용 중인 WMS 서버 종류에 따라 설정
        }),
        zIndex: 2
    });
}

const scaleLineControl = new ScaleLine({
  units: 'metric', // 기본 단위는 'metric'으로 설정
  bar: true,
  steps: 4,
  text: true,
});

// cm 단위로 변환하는 커스텀 함수 정의
scaleLineControl.getScaleForResolution = function(resolution) {
  const dpi = 25.4 / 0.28; // 25.4mm per inch / 0.28mm per pixel (기본값)
  const mpu = this.getMap().getView().getProjection().getMetersPerUnit();
  const scale = resolution * mpu * 39.37 * dpi; // 1 meter = 39.37 inches
  return scale * 100; // meter to centimeter 변환
};

// 사용자 정의 단위 문자열 설정
scaleLineControl.render = function() {
  const scale = this.getScaleForResolution(this.getMap().getView().getResolution());
  this.element.innerHTML = `${scale.toFixed(2)} cm`;
};

export const useMap = () => { // 배경지도만 따로 분리
    const [map, setMap] = useState(null);
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
            layers: [vworldBaseLayer, UOSbasemapTile],
            target: 'map',
            view: view,
        });

        setMap(newMap);

        return () => {
            newMap.setTarget(null);
        };
    }, []);
    return map;
}

export const MapC = ({ pathData, width, height, keyword, setKeyword, bol, bump, slopeD, showObs, setShowObs, category, onObstacleAvoidance,}) => {
    const map = useMap();
    const [layerState, setLayerState] = useState('base-base');
    var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열
    // ScaleLine 컨트롤 생성

    const handleLayerClick = (layer) => {
        setLayerState(layer);
    }
    const handlePositions = (data) => {
        for (let i=0;i<data.length;i++){
            //console.log(data[i].bulid_name,data[i].floor,'층')
            const indoorLayer = createIndoorLayer(data[i].bulid_name,data[i].floor)
            map.addLayer(indoorLayer)
        }
    }

    const getPositionOf = async (locaArray) => {
        const req = locaArray;
        try {
            var response = await axios.post(NODE_BACKEND_URL+'/showYourPosition', req, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            handlePositions(response.data)
        } catch (error) {
          console.error('Error during Axios POST request', error);
        }
    };

    const createShortestPathLayer = (pathData) => {
        //console.log("pathData:", pathData);
        const colorPalette = ['#FD5230', '#007AC5', '#00b398','#44EAC5','purple','blue','orange', 'cyan', 'magenta'];

        pathData.forEach((path, index) => {
            const listOfEdgeId = path.map(e => e.edge);
            const crsFilter = makeCrsFilter(listOfEdgeId);
            //1개면 -> 0
            //2개면 -> 1, 2, 0
            //3개면 -> 1, 2, 3, 0
            //내가 원하는 거: 1개면 -> 노랑
            // 2개 이상이면 -> 현재처럼
            let colorIndex = (index === pathData.length - 1) ? 0 : index +1; //마지막 인덱스이면 0, 그렇지 않으면 +1
            if(pathData.length===1){colorIndex = 2;}
            const shortestPathLayer = new VectorLayer({
                title: `UOS Shortest Path ${index + 1}`,
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                        '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='+crsFilter
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: colorPalette[colorIndex],
                        width: 4
                    })
                }),
                zIndex: 3
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
                zIndex: 6
            });
            nodeLayers.push(nodeLayer);
            map.addLayer(nodeLayer);
        });
        return nodeLayers;
    }

    useEffect(() => {
        if (map) {
            console.log('-------rendering------')
            const layerExists = map.getLayers();
            map.addControl(scaleLineControl);    // 축척
            // 배경지도 옵션 설정
            if (layerExists) {
                switch (layerState) {
                    case 'base-base':
                        map.getLayers().clear();
                        map.addLayer(vworldBaseLayer);
                        map.addLayer(UOSbasemapTile);
                        map.addLayer(basePoiText);
                        break;
                    case 'base-satellite':
                        map.getLayers().clear();
                        map.addLayer(vworldSatelliteLayer);
                        map.addLayer(UOSorthoTile);
                        map.addLayer(satellitePoiText);
                        break;
                    default:
                        map.getLayers().clear();
                        map.addLayer(osmLayer);
                        break;
                }
            }

            // 출발지 도착지 다 분홍색 노드로 보여줬던 부분. 링크 추출
            if (pathData && pathData.length >= 1) { // 경로를 이루는 간선이 하나라도 존재를 하면
                createShortestPathLayer(pathData);
                //console.log('엥:',pathData)
                locaArray = makelocaArrayFromNodes(pathData,locaArray); // pathData 가공해서 locaArray 도출
                //console.log('여기:',locaArray)
                // 건물 출입구
                const entryMarker = createEntryMarkerLayer(getNodeIdsOnPath(pathData).map(Number))
                map.addLayer(entryMarker)
            }

            // 출발, 도착, 경유 노드 마커 표시
            if (locaArray && locaArray.length >= 2) {
                let selectSingleClick = new Select({ //feature 클릭 가능한 select 객체
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: createNAddNodeLayersFrom(locaArray)
                });
                map.addInteraction(selectSingleClick);
                markerClickEventWith(locaArray, selectSingleClick); // 노드 마커 클릭 이벤트*/

                getPositionOf(locaArray)
            }
        }
    }, [map, layerState, pathData, showObs]);

    useEffect(() => { // 건물 | 하늘못 | 운동시설 검색 시
        if (map && keyword) {
            // Replace 'desiredName' with the name you want to filter by
            let cqlFilter = encodeURIComponent("bg_name like '%"+keyword+"%'" + "or nickname like '"+keyword+"' or eng_name ILIKE '%"+keyword+"%'");
            const poiMarkerLayer = createPoiMarkerLayer(cqlFilter)
            map.addLayer(poiMarkerLayer)

            let selectBuildClick = new Select({
               condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
               layers: [poiMarkerLayer]
            });
            map.addInteraction(selectBuildClick);
            poiMarkerClickEventWith(keyword,selectBuildClick); // 건물 마커 클릭 이벤트

           return () => {
                map.removeLayer(poiMarkerLayer);
           }
        }
    }, [layerState,keyword])

    useEffect(() => {
        // showObs가 true일 때만 ShowObsOnPath 컴포넌트를 렌더링
        if (showObs) {
            // showObs가 true이면 컴포넌트를 다시 렌더링하도록 상태를 변경
            setShowObs(false);
            setTimeout(() => setShowObs(true), 0);
        }
    }, [layerState]); // layerState가 변경될 때마다 useEffect 실행

    return (
        <div>
            <div className="select-layer-wrap">
                <button className={`select-layer-button ${layerState === 'base-base' ? 'selected' : ''}`} onClick={() => handleLayerClick('base-base')}>
                    <img src={layerBase} alt="base layer img" className="layer-image" />
                    <span className="layer-text">일반지도</span>
                </button>
                <button className={`select-layer-button ${layerState === 'base-satellite' ? 'selected' : ''}`} onClick={() => handleLayerClick('base-satellite')}>
                    <img src={layerDrone} alt="drone layer img" className="layer-image" />
                    <span className="layer-text">드론지도</span>
                </button>
            </div>
            <div id="map" style={{ width, height }}></div>
            {map && category && category.type && <HandleCategoryClick category = {category} map = {map}/>}
            {map && showObs && (
                <ShowObsOnPath
                    map={map}
                    pathData={pathData}
                    locaArray={locaArray}
                    bump={bump}
                    bol={bol}
                    slopeD={slopeD}
                    onObstacleAvoidance={onObstacleAvoidance}
                />
            )}
        </div>
    );
};