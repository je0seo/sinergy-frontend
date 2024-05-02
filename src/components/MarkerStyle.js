import {Circle, Fill, Stroke, Style, Icon} from "ol/style";

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
import toiletIcon from './images/icons/toiletIcon.png';

import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/Irumaker2.png';

export const Icons = {
    bumpIcon, bolIcon, unpavedIcon, stairsIcon, slopeIcon, facilitiesIcon, benchIcon, atmIcon,
    bicycleIcon, smokingIcon, storeIcon, cafeIcon, postOfficeIcon, healthServiceIcon, cafeteriaIcon,
    printIcon, gymIcon, tennisIcon, basketballIcon, breakRoomIcon, loungeIcon, seminarRoomIcon,
    sBicycleIcon, vendingMachineIcon, libraryIcon, toiletIcon
}

export const clickedLinkStyle = new Style({
     stroke: new Stroke({
         color: 'rgba(255, 255, 255, 1)',
         width: 7
     })
})

export const basicMarkerStyle = (irumarker) => { //출발지 스타일
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

export const clickedMarkerStyle = (irumarker) => {
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

export const showMarkerStyle = (markertype) => {
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
        case 'toilet': markerimg = toiletIcon; break;
        case 'bump': markerimg = bumpIcon; break;
        case 'bol': markerimg = bolIcon; break;
        case 'unpaved':
            return new Style({
                stroke: new Stroke({
                    color: '#711B6B', // 선의 색상
                    width: 4 // 선의 두께
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