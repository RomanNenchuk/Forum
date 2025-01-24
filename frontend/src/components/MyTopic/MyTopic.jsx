import React, {useState} from "react";
import { Link } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTopicSearch } from "../../contexts/TopicSearchContext";
import axios from "axios";
import { Container } from "react-bootstrap";

const MyTopic = () => {
    const { currentUser, token } = useAuth();
    const { userName, fullName} = useUserInfo();
    const { setQueryParams, topicInfoList} = useTopicSearch()
    
    const [firstStepChoose, setFirstStepChoose] = useState(0)
    

    async function fetchData() {
        setQueryParams({
            page: 1,
              sortOrder: "desc",
              tags: "",
              authors: '',
        })
        const res = topicInfoList
        console.log(userName)
        console.log(res)
    }



    return (<div style = {{display: "flex", flexDirection: "column", overflow:"hidden",width: "100%"}}>
        <div style = {{ marginTop: "14vh", width: "100%"}}>
            <div style = {{marginTop: "3vh",width: "100%"}}>
            <div style = {{display: "flex",width: "100%", flexDirection:'row', justifyContent:"space-around",padding: "2vh"}}>
              <div style = {firstStepChoose === 0 ? {boxShadow: "0 0.3vh 0 0 #659287"} : {}}
              onClick = {()=>setFirstStepChoose(0)}>Мої теми</div>
              <div style = {firstStepChoose !== 0 ? {boxShadow: "0 0.3vh 0 0 #659287"} : {}}
              onClick = {()=>{setFirstStepChoose(1); fetchData()}}>Збережені</div>
            </div>
            <div style = {{marginTop: "3vh",display: "flex",justifyContent: "center", width: "100%"}}>
            <Link
                to={currentUser ? "/create-topic" : "/login"}
                state={{redirectPath: "/create-topic",}}
                style = {{width: "55%"}}
            >
            <button style = {{width: "100%"}} className="add-topic-button">+ Додати тему</button>
        </Link>
        </div>
            </div>
            <div style = {{width: "100%"}}></div>

        </div>
    </div>)
}

export default MyTopic