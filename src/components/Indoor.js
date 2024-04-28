// 층 정보 DB로부터 가져오기 먼저 (server.js 또는 Gerserver에서 WFS로)
const getStairs = () => {
    return totalStairs
}
// 모든 층 버튼 만들기
const createButtons = (totalFloors) => {
    for (let i=0;i<totalFloors;i++) {
        // 층 개수만큼 버튼 생성(for문)
        return (<ButtonUI floor = {i+1}/>)
    }
}
// 해당 층 레이어 표출
const showTheFloor = (floor) => {

}

const ButtonUI = ({floor, isZoom}) => { // zoom할 시 층 버튼 가시화 <- 이건 MapC에서 줌 되었을 때 어떤 인자를 여기로 보내주든가 해야할 듯
    return (
        <div>
            <button onClick={showTheFloor(floor)}>${floor}층</button>
        <div>
    );
}