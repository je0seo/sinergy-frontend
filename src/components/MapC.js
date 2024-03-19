import { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { get as getProjection, fromLonLat } from 'ol/proj';
import makeCrsFilter4node from "./utils/filter-for-node.js";
import makeCrsFilter from "./utils/crs-filter.js";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Stroke, Style, Icon} from "ol/style";
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/Irumarker2.png';


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

const MapC = ({ pathData, width, height, keyword }) => {
    const [map, setMap] = useState(null);
    const [layerState, setLayerState] = useState('base-osm');

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
    const poiStyleS = (feature) => { //출발지 스타일
        return new Style({
            image: new Icon({
                src: irumarkerS, 
                scale: 0.1, // 이미지의 크기
                opacity: 1, // 이미지의 투명도
                rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부
                rotation: 0 // 이미지의 초기 회전 각도
            })
        });
    };
    const poiStyle2 = (feature) => { //경유지 스타일
        return new Style({
            image: new Icon({
                src: irumarker2, 
                scale: 0.2, 
                opacity: 1, 
                rotateWithView: false, 
                rotation: 0, 
            })
        });
    };
    const poiStyleE = (feature) => {
        return new Style({
            image: new Icon({
                src: irumarkerE, // 이미지 파일의 경로를 설정합니다.
                scale: 0.1, // 이미지의 크기를 조절합니다. 필요에 따라 조절하세요.
                opacity: 1, // 이미지의 투명도를 조절합니다.
                rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부를 설정합니다.
                rotation: 0 // 이미지의 초기 회전 각도를 설정합니다.
            })
        });
    };
		//추가부분
    proj4.defs('EPSG:5181', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs');
    register(proj4);

    const UOSbasemapTile = new TileLayer({
        title: 'UOS Base Map',
        visible: true,
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:basemap' },
            serverType: 'geoserver',
        }),
    });

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
            const layerExists = map.getLayers();
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
            // Add UOS Shortest Path layers
            var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열
            // 출발지 도착지 다 분홍색 노드로 보여줬던 부분. 링크 추출
            if (pathData && pathData.length >= 1) { // 경로를 이루는 간선이 하나라도 존재를 하면
                pathData.forEach((path, index) => {
                    const listOfEdgeId = path.map(e => e.edge);
                    const listOfNodeId = path.map(n => n.node);
                    locaArray.push(listOfNodeId[0]);
                    const crsFilter = makeCrsFilter(listOfEdgeId);
                    if (index === pathData.length - 1) {
                        locaArray.push(listOfNodeId[listOfNodeId.length - 1]);
                    }
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
                    
                });
                console.log(locaArray);
            }
            // 출발, 도착, 경유 노드 표시
            if (locaArray && locaArray.length >= 2) {
                locaArray.forEach((nodeId, index) => {
                    let poiStyle;
                     if (index === 0) { // 출발지
                        poiStyle = poiStyleS;
                    } else if (index === locaArray.length - 1) { //도착지
                        poiStyle = poiStyleE;
                    } else {
                        poiStyle = poiStyle2; // 경유지
                    }
                    //const crsFilter = makeCrsFilter4node(locaArray);
                    /*const shortestPathLayer = new TileLayer({
                        title: `Marker ${index + 1}`,
                        source: new TileWMS({
                            url: 'http://localhost:8080/geoserver/gp/wms',
                            params: { 'LAYERS': 'gp:node', ...crsFilter },
                            serverType: 'geoserver',
                            visible: true,
                        }),
                        zIndex: 5,
                        style: poiStyle,
                    });
                    */

                    // shortestPathLayer을 WMS방식에서 WFS로 변경. 아래 poiSurce랑 poiLayer 코드에서 수정.
                    const shortestPathLayer = new VectorLayer({
                        title: `Marker ${index + 1}`,
                        visible: true,
                        source: new VectorSource({ // feature들이 담겨있는 vector source
                            format: new GeoJSON({
                                dataProjection: 'EPSG:5181'
                            }),
                            url: function(extent) {
                                return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                                    '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id='+nodeId;
                            },
                            serverType: 'geoserver'
                        }),
                        style: poiStyle,
                        zIndex: 5
                    });

                    map.addLayer(shortestPathLayer);
                })
            }

            if (keyword) {
                let cqlFilter = encodeURIComponent("name like '%"+keyword+"%'"); // Replace 'desiredName' with the name you want to filter by

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
                // poiLayer -> makerLayer (이름 변경)
                const markerLayer = new VectorLayer({
                    title: 'POI',
                    visible: true,
                    source: poiSource,
                    style: poiStyle2,
                    zIndex: 4
                });
                map.addLayer(markerLayer)

                // 수아 추가
                // feature 클릭 가능한 select 객체
                let selectSingleClick = new Select({
                    condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                    style: new Style({
                        stroke: new Stroke({
                            color: 'white',
                            width: 3
                        }),
                        fill: new Fill({
                            color: 'rgba(0,0,255,0.6)'
                        })
                    })
                });
                map.addInteraction(selectSingleClick); // map 객체에 Select 객체 추가
                
                // 기존 색상을 담는 객체
                let _style = null;
                // feature를 선택할 때 이벤트
                selectSingleClick.on('select', function(e) {
                    console.log('click');
                    /*// 이전에 선택한 feature가 있을 경우
                    if(e.target.getFeatures()!== undefined){
                        _style = e.target.getFeatures.a[0]; // 기존 색상 담기
                        _style.setStyle(null); // 기존 색상 제거
                    } else{ // 선택된 feature가 없는 경우, 이전에 선택한 feature의 스타일을 복원하고 정보를 비웁니다.
                        _style.setStyle(poiStyle2); // 기존 색상 추가
                    }*/
                });
            }
        }
    }, [map, layerState, pathData, keyword]);

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
        </div>
    );
};

export default MapC;