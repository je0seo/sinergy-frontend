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
import {showMarkerStyle, clickedLinkStyle} from './MarkerStyle'
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

/*const fetchFeatures = (url) => {
    return fetch(url)
        .then(response => response.json())
        .then(data => data.totalFeatures); // 반환된 피처 수 반환
}*/
// 피처 수를 확인하고 레이어를 생성하는 함수 -> 바로 link obs 집합 layer return
const createLayerIfNeeded = (url) => {
    return new VectorLayer({
        title: `linkObs Layer`,
        visible: true,
        source: new VectorSource({
            format: new GeoJSON({
                dataProjection: 'EPSG:5181'
            }),
            url: url,
            serverType: 'geoserver'
        }),
        zIndex: 6,
        style:
        new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.1)',
                width: 3
            })
        })
    });
}

const ShowObsOnPath = ({map, pathData, locaArray, bump, bol, showObs}) => {
    let [bumpLayer, setBumpLayer] = useState([]);
    let [bolLayer, setBolLayer] = useState([]);
    let [linkObsLayer, setLinkObsLayer] = useState([]);

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
                const linkLayer = createLayerIfNeeded(url)
                setLinkObsLayer(linkLayer) //setLinkObsLayer(createLayerIfNeeded(url)) 하면 null오류 남
                map.addLayer(linkLayer);
                /*createLayerIfNeeded(url)
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

                        const select4Popup = setPopupSelect(linkLayer, map)

                        select4Popup.on('select', (event) => {
                            const features = event.selected;
                            const feature = features[0];
                            if (feature){
                                 feature.setStyle(clickedLinkStyle)
                                 //setImage(feature.get('image_lobs'))
                                 //setContent('경사도[degree] <br>'+feature.get('slopel'))
                                 //map.addOverlay(popupOverlay) // 4. 팝업 가시화
                            }
                        });

                    //})
                    //.catch(error => {
                      //  console.error('에러 발생: ', error);
                    //});


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
