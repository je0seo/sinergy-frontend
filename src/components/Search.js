import { useEffect, useState } from 'react';
import axios from 'axios';
import {NODE_BACKEND_URL} from "../constants/urls";
import './MapC.css';
import {Icons} from './MarkerStyle'

const searchBuildingInfo = async (keyword, setBuildingInfo) => {
    console.log('(searchBuildingINFO)')
    const req = {keyword};
    try {
        var response = await axios.post(NODE_BACKEND_URL+'/showBuildingInfo', req, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setBuildingInfo(response.data);
    } catch (error) {
      console.error('Error during Axios POST request', error);
    }
};

const useSearch = (keyword) => {
    const [bgName, setBgName] = useState('');
    const [engName, setEngName] = useState('');
    const [bgId, setBgId] = useState(0);
    const [bgSummary, setBgSummary] = useState('');
    const [bgImage, setBgImage] = useState('');
    const [totalFloors, setTotalFloors] = useState(0);
    const [loungeCnt, setLoungeCnt] = useState(0);
    const [type, setType] = useState('');

    const [resultExistence, setResultExistence] = useState(true);
    const [candidatesExist, setCandidatesExist] = useState(false);
    const [resultList, setResultList] = useState([])

    const setBuildingInfo = (data) => {
        if (data.rowCount == 0) {           // 검색 결과가 없을 때
            setResultExistence(false);
        } else if (data.rowCount == 1) {    // 검색 결과가 1개일 때
            setBgName(data.rows[0].bg_name)
            setEngName(data.rows[0].eng_name)
            setBgId(data.rows[0].bd_id)
            setBgSummary(data.rows[0].summary)
            setLoungeCnt(data.rows[0].lounge_count)
            setTotalFloors(data.rows[0].total_floor)
            setType(data.rows[0].type)
            setBgImage(data.rows[0].image_url)
       } else { // 검색 결과 후보가 여러 개일 때
           setCandidatesExist(true)
           const updatedResultList = [];
           for (let i=0;i<data.rowCount;i++){
               updatedResultList.push(data.rows[i].bg_name);
           }
           setResultList(updatedResultList)
       }
    }

    useEffect(() => {
        //SideEffect
        searchBuildingInfo(keyword, setBuildingInfo)

        return () => { // clean-up
            setResultExistence(true)
            setResultList([]);
            setCandidatesExist(false);
        }
    }, [keyword]) // SideEffect가 첫번째 렌더링 이후 한번 실행되고, 이후 특정 값의 업데이트를 감지했을 때마다 실행되어야 하는 경우

    return {bgImage, bgName, engName, type, bgId, totalFloors, resultExistence, candidatesExist,
    setCandidatesExist, resultList, loungeCnt, bgSummary};
}

const SearchResultUIComponent = ({keyword, setKeyword}) => {
    const {bgImage, bgName, engName, type, bgId, totalFloors, resultExistence,
    candidatesExist, setCandidatesExist, resultList, loungeCnt, bgSummary} = useSearch(keyword);

    if (resultExistence == false)
        return (
            <div>
                <h3> 검색 결과가 존재하지 않습니다.</h3>
            </div>
        )
    if (candidatesExist == true) {
        return (
            <div>
                {resultList.map((item, index) => (
                    <button key={index} className = 'result-list' onClick={() => {setCandidatesExist(false); setKeyword(item)}}>
                        <img src={Icons.magnifier} style={{width:'5%', height:'5%'}}></img>
                        <div style={{paddingLeft: '8px'}}>{item}</div>
                    </button>
                ))}
            </div>
        )
    }
    if (resultExistence && !candidatesExist) {
        return (
            <div style={{margin: '0 auto'}}>
                {bgImage && <img className="bg-image" src={bgImage} alt="Building Image" style={{width: '350px',height: '250px',display: 'block',margin: '0 auto'}}/>}
                <div className="info-content">
                    <h3 style={{margin: '0 auto', backgroundColor: '#FFCD4A'}}> {bgName}({engName}) {<button className='button' onClick={() => setKeyword('')}>닫기</button>}</h3>
                    <div style={{fontSize: '14px', marginTop: '5px'}}> [ {type} | {(type === '건물') && (<> No.{bgId} | 총 {totalFloors}층 </>)} ] </div>
                    {loungeCnt && <>라운지 수 : {loungeCnt}</>}
                    <p style={{marginTop: '5px', marginBottom: '0px'}}> {bgSummary} </p>
                </div>
            </div>
        );
    }
}

export default SearchResultUIComponent;