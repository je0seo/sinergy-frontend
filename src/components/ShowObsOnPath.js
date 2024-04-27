import { useEffect, useState } from 'react';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {GeoJSON} from "ol/format";
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

import {makeCrsFilter} from "./utils/crs-filter.js";
import { Stroke, Style } from "ol/style";
import {showMarkerStyle} from './MarkerStyle'
import {setPopupSelect, PopupUIComponent} from './PopupC'

const getNodeIdsOnPath = (pathData) => {
    let listOfNodeId = [];
    pathData.forEach((path, index) => {
        listOfNodeId = path.map(n => n.node)
    });
    return listOfNodeId
}

const getEdgeIdsOnPath = (pathData) => {
    let listOfEdgeId = [];
    pathData.forEach((path, index) => {
        listOfEdgeId = path.map(e => e.edge);
    });
    listOfEdgeId.pop()
    return listOfEdgeId
}

const url4AllLinkObs = (edgeIds) => {
    const crsFilter = makeCrsFilter(edgeIds);
    return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
           '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='
           + crsFilter
           + ' AND (link_att IN (4,5) OR (grad_deg >= 3.18 AND link_att NEQ 5))'
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
    //console.log(obsSource.getFeatures())
    const obsLayer = new VectorLayer({
        title: `ShowObsOnPath Layer`,
        visible: true,
        source: obsSource,
        zIndex: 6,
        style: showMarkerStyle(obsType.type),
    });
    return obsLayer
}

const fetchFeatures = (url) => {
    return fetch(url)
        .then(response => response.json())
        .then(data => data.totalFeatures); // 반환된 피처 수 반환
}
// 피처 수를 확인하고 레이어를 생성하는 함수
const createLayerIfNeeded = (url) => {
    return fetchFeatures(url)
        .then(featureCount => {
            if (featureCount > 0) {
                const layer = new VectorLayer({
                    title: `ShowReqIds Layer`,
                    visible: true,
                    source: new VectorSource({
                        format: new GeoJSON({
                            dataProjection: 'EPSG:5181'
                        }),
                        url: url,
                        serverType: 'geoserver'
                    }),
                    zIndex: 6,
                    style: //showMarkerStyle('unpaved')
                    new Style({
                        stroke: new Stroke({
                            color: 'rgba(255, 255, 255, 0.1)',
                            width: 3
                        })
                    })
                });
                return layer; // 레이어 반환
            } else {
                return null; // 피처가 없을 경우 null 반환
            }
        })
        .catch(error => {
            console.error('에러 발생: ', error);
            throw error; // 에러를 다시 던져서 상위 함수에서 처리하도록 함
        });
}

const ShowObsOnPath = ({map, pathData, locaArray, bump, bol, showObs}) => {
    let [bumpLayer, setBumpLayer] = useState([]);
    let [bolLayer, setBolLayer] = useState([]);

    useEffect(() => {
        if (map && locaArray && locaArray.length >= 2) {
            let pathNodeIds = getNodeIdsOnPath(pathData).map(Number);
            let pathEdgeIds = getEdgeIdsOnPath(pathData).map(Number);

            if (showObs) {
                // 1. 노드 장애물 레이어 생성 및 지도에 추가
                const bumpMarker = createObsLayerWith(bump, pathNodeIds)
                const bolMarker = createObsLayerWith(bol, pathNodeIds)
                setBumpLayer(bumpMarker)
                setBolLayer(bolMarker)
                map.addLayer(bumpMarker)
                map.addLayer(bolMarker)

                // 2. 범례 지도에 시각화
                pathData.forEach((path, index) => {
                    const listOfEdgeId = path.map(e => e.edge);
                    const crsFilter = makeCrsFilter(listOfEdgeId);
                    const legendLayer = new TileLayer({
                        title: `UOS Shortest Path ${index + 1}`,
                        source: new TileWMS({
                            url: 'http://localhost:8080/geoserver/gp/wms',
                            params: { 'LAYERS': 'gp:link','CQL_FILTER': crsFilter },
                            serverType: 'geoserver',
                            visible: true,
                            }),
                        zIndex: 2
                    });
                    map.addLayer(legendLayer);
                })

                // 3. 클릭 가능한 장애물 link 객체 생성
                const url = url4AllLinkObs(pathEdgeIds)
                createLayerIfNeeded(url)
                    .then(linkObsLayer => {
                        // linkObsLayer가 존재하면 map에 레이어 추가
                        if (linkObsLayer) {
                            map.addLayer(linkObsLayer);
                        }

                        /*const popupOverlay = new Overlay({
                            element: popupContainerRef.current,
                            positioning: 'bottom-left',
                            autoPan: {
                                animation: {
                                    duration: 250
                                }
                            }
                        });*/

                        const select4Popup = setPopupSelect(linkObsLayer, map)

                        select4Popup.on('select', (event) => {
                            const features = event.selected;
                            const feature = features[0];
                            if (feature){
                                 const clickedStyle = new Style({
                                     stroke: new Stroke({
                                         color: 'rgba(255, 255, 255, 1)',
                                         width: 7
                                     })
                                 })
                                 feature.setStyle(clickedStyle)  //1. 클릭 시 스타일 바꾸기

                                 const [ minX, minY, maxX, maxY ] = feature.getGeometry().getExtent();
                                 const coordinate = [ (maxX + minX) / 2, (maxY + minY) / 2 ] // 2. 팝업 뜨는 위치를 위한 좌표 설정
                                 //popupOverlay.setPosition(coordinate); // 3. 피처 좌표에 팝업 띄우기

                                 //setImage(feature.get('image_lobs'))
                                 //setContent('경사도[degree] <br>'+feature.get('slopel'))
                                 //map.addOverlay(popupOverlay) // 4. 팝업 가시화
                            }
                        });

                    })
                    .catch(error => {
                        console.error('에러 발생: ', error);
                    });

                return () => {
                    map.removeLayer(bumpMarker);
                    map.removeLayer(bolMarker);
                    //map.removeInteraction(select4Popup);
                }
            }
        }
    }, [map, pathData, bump, bol, showObs]);

    return (
        <div>
            {bump && bump.type && <PopupUIComponent category={bump} map={map} layer={bumpLayer}/>}
            {bol && bol.type && <PopupUIComponent category={bol} map={map} layer={bolLayer}/>}
        </div>
    );
}
export default ShowObsOnPath;
