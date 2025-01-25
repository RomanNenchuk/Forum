import React, {useState , useEffect} from "react";
import { Link } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTopicSearch } from "../../contexts/TopicSearchContext";
import AltSpinner from '../AltSpinner/AltSpinner'
import TopicArea from "../TopicList/TopicArea";
import axios from "axios";
import { Container } from "react-bootstrap";

const MyTopic = () => {
    const {currentUser } = useAuth()
    const [ data , setData ] = useState([])
    const [ loading, setLoading ]= useState(false)
    
    const [firstStepChoose, setFirstStepChoose] = useState(0)
    

    const reactionList = [
        { icon: "😁", name: "beaming_face_with_smiling_eyes" },
        { icon: "😅", name: "grinning_face_with_sweat" },
        { icon: "😎", name: "smiling_face_with_sunglasses" },
        { icon: "🤔", name: "thinking_face" },
        { icon: "😐", name: "neutral_face" },
        { icon: "😯", name: "hushed_face" },
        { icon: "😔", name: "pensive_face" },
        { icon: "😬", name: "grimacing_face" },
        { icon: "💪", name: "flexed_biceps" },
        { icon: "👌", name: "OK_hand" },
        { icon: "❤️", name: "red_heart" },
        { icon: "💔", name: "broken_heart" },
        { icon: "🙅‍♂️", name: "man_gesturing_NO" },
        { icon: "🙅‍♀️", name: "woman_gesturing_NO" },
        { icon: "🤦‍♂️", name: "man_facepalming" },
        { icon: "🤦‍♀️", name: "woman_facepalming" },
        { icon: "🤷‍♂️", name: "man_shrugging" },
        { icon: "🤷‍♀️", name: "woman_shrugging" },
        { icon: "😡", name: "enraged_face" },
        { icon: "🤡", name: "clown_face" },
        { icon: "💀", name: "skull" },
        { icon: "💩", name: "pile_of_poo" },
      ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/topics/mytopics?user_id=${currentUser.uid}`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching user topics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);


    
    return (<div style = {{display: "flex", flexDirection: "column", overflow:"hidden",width: "100%"}}>
        <div style = {{marginTop: "14vh", width: "100%"}}>
            <div style = {{marginTop: "3vh",width: "100%"}}>
            <div style = {{display: "flex",width: "100%", flexDirection:'row', justifyContent:"space-around",padding: "2vh"}}>
              <div style = {firstStepChoose === 0 ? {boxShadow: "0 0.3vh 0 0 #659287",fontSize: "3vh"} : {fontSize: "3vh"}}
              onClick = {()=>setFirstStepChoose(0)}>Мої теми</div>
              <div style = {firstStepChoose !== 0 ? {boxShadow: "0 0.3vh 0 0 #659287" ,fontSize: "3vh"} : {fontSize: "3vh"}}
              onClick = {()=>{setFirstStepChoose(1);console.log(data)}}>Збережені теми</div>
            </div>
            <div style = {{marginTop: "3vh",display: "flex",justifyContent: "center", width: "100%"}}>
            <Link
                to={currentUser ? "/create-topic" : "/login"}
                state={{redirectPath: "/create-topic",}}
                style = {{width: "55%"}}
            >
                <button style = {{width: "100%", borderRadius: "0px"}} className="add-topic-button">+ Додати тему</button>
            </Link>
            </div>
            </div>
            <div style = {{display: "flex",justifyContent: "center"}}>
            {!loading ? <div style = {{display: "grid", gap: "5vh", gridTemplateColumns: "repeat(2, 1fr)",width: "90%",
            justifyContent: "center",marginTop : "4vh", gridTemplateRows: "repeat(auto-fill, 1fr)"}}>
                {data.map((el, index) => (
                    <div style={{ gridColumn: `${index - Math.floor(index / 2) * 2 + 1}` }}>
                        <TopicArea topic={el} reactionList={reactionList} 
                        initialReactions={el.reactions}   userReaction={el.user_reaction} setTopics={setData}  />
                    </div>
                ))}
            </div> : <AltSpinner />}
            </div>
        </div>
    </div>)
}

export default MyTopic