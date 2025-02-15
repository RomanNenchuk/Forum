import React, {useState ,useRef,  useEffect} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AltSpinner from '../AltSpinner/AltSpinner'
import { useScrollLock } from "../../hooks/useScrollLock.jsx";
import TopicArea from "../TopicList/TopicArea";
import TopicList from "../TopicList/TopicList.jsx";
import TopicActionMenu from "../TopicList/TopicActionMenu";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal.jsx";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import Share from "../Share.jsx";
import axios from "axios";


const MyTopic = () => {
    const {currentUser } = useAuth()
    const [ data , setData ] = useState([])
    const [ loading, setLoading ]= useState(false)
    const topicListRef = useRef()
    const {width} = useWidth()
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

    
      const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
      const [actionMenu, setActionMenu] = useState({
        selectedTopic: -1,
        selectedTopicItem: null,
        position: {
          x: 0,
          y: 0,
        },
        toggled: false,
      });
    
      const actionMenuRef = useRef(null);
      useScrollLock(isActionMenuOpen, topicListRef);
    
      function handleOnActionMenu(e, topic) {
        e.preventDefault();
        const actionMenuAttr = actionMenuRef.current.getBoundingClientRect();
        const isRight = e.clientX > window?.innerWidth / 2;
        const isBottom = e.clientY > window?.innerHeight / 2;
    
        let x = e.clientX;
        let y = e.clientY;
    
        if (isRight) x -= actionMenuAttr.width;
        if (isBottom) y -= 57;
        setIsActionMenuOpen(true);
    
        setActionMenu({
          selectedTopic: topic.id,
          selectedTopicItem: topic,
          position: {
            x,
            y,
          },
          toggled: true,
        });
      }
    
      useEffect(() => {
        function handler(e) {
          if (actionMenuRef.current) {
            if (!actionMenuRef.current.contains(e.target)) {
              resetActionMenu();
            }
          }
        }
        document.addEventListener("mousedown", handler);
        document.addEventListener("scroll", handler);
        return () => {
          document.removeEventListener("mousedown", handler);
          document.removeEventListener("scroll", handler);
        };
      }, []);
    
      function resetActionMenu() {
        setIsActionMenuOpen(false);
        setActionMenu({
          selectedTopic: -1,
          selectedTopicItem: null,
          position: {
            x: 0,
            y: 0,
          },
          toggled: false,
        });
      }
    
      async function deleteTopic(id) {
        if (confirm("Ви впевнені, що хочете видалити тему?")) {
          console.log("On delete topic " + id);
          try {
            const res = await axios.delete(`http://localhost:5000/topics/${id}`);
            if (res.data.done)
              setTopicInfoList(prev => prev.filter(item => item.id != id));
          } catch (error) {
            console.error(error);
          }
        }
      }
      
    
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/topics/mytopics?user_id=${currentUser.uid}`);
            setData(response.data);
            setData((prevState) => 
              prevState.map((el) => ({
                ...el, 
                subscribed: 'none' 
              }))
            );
        } catch (error) {
            console.error("Error fetching user topics:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchSavedData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/topics/saved?user_id=${currentUser.uid}`
          );
          console.log(response.data);
          setData(response.data);
        } catch (error) {
          console.error("Error fetching user topics:", error);
        } finally {
          setLoading(false);
        }
      };
   
    const toChoose = (choose) => {
        setLoading(true)
        if(choose){
            setFirstStepChoose(1)
            fetchSavedData()
        }
        else{
            setFirstStepChoose(0)
            fetchData()
        }
    }


    useEffect(() => {
        fetchData();
       
        
    }, [currentUser]);


    const [switchText, setSwitchText] = useState("Не зберігати");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [topicToDeleteId, setTopicToDeleteId] = useState(null);


    const handleDeleteClick = id => {
      setTopicToDeleteId(id);
      setIsConfirmModalOpen(true);
    };

    async function switchTopicToUser(user_id, topic_id) {
      try {
        const res = await axios.patch(`http://localhost:5000/topics/switch`, { user_id, topic_id, });
        setData(prev => prev.filter(item => item.id !== topic_id));
        // console.log(res.data);
      } catch (error) {
        console.error(error);
      }
    }

    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [shareId, setShareId] = useState(-1);
  
    function handleShareClick() {
      setShareId(actionMenu.selectedTopic);
      setShareModalOpen(true);
    }

    const handleConfirmDelete = () => {
      if (topicToDeleteId) {
        deleteTopic(topicToDeleteId);
        navigate("/mytopics");
      }
    };


    return (<div style = {{display: "flex", flexDirection: "column",width: "100%"}}>
        <div style = {width > 768 ? {marginTop: "14vh", width: "100%"} : {marginTop: "8vh", width: "100%"}}>
        {width > 768 ? <><div style = {{marginTop: "3vh",width: "100%"}}>
            <div style = {{display: "flex",width: "100%", flexDirection:'row', justifyContent:"space-around",padding: "2vh"}}>
              <div style = {firstStepChoose === 0 ? {boxShadow: "0 0.3vh 0 0 #659287",fontSize: "3vh"} : {fontSize: "3vh"}}
              onClick = {()=>toChoose(0)}>Мої теми</div>
              <div style = {firstStepChoose !== 0 ? {boxShadow: "0 0.3vh 0 0 #659287" ,fontSize: "3vh"} : {fontSize: "3vh"}}
              onClick = {()=>{toChoose(1)}}>Збережені теми</div>
            </div>
            <div style = {{marginTop: "3vh",display: "flex",justifyContent: "center", width: "100%"}}>
           {!firstStepChoose ? <Link
                to={currentUser ? "/create-topic" : "/login"}
                state={{redirectPath: "/create-topic",}}
                style = {{width: "55%"}}
            >
                <button style = {{width: "100%", borderRadius: "0px"}} className="add-topic-button">+ Додати тему</button>
            </Link> : ''}
            </div>
            </div>
            <div style = {{display: "flex",justifyContent: "center"}}>
            {!loading ? (
                  <div
                    style={{
                      display: "grid",
                      gap: "5vh",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      width: "90%",
                      justifyContent: "center",
                      marginTop: "4vh",
                      gridTemplateRows: "repeat(auto-fill, 1fr)",
                    }}
                  >
                    {data.map((el, index) => (
                      <div
                      
                        key={el.id}
                        style={{
                          gridColumn: `${index - Math.floor(index / 2) * 2 + 1}`,
                        }}
                      >
                        <TopicArea
                          topic={el}
                          reactionList={reactionList}
                          initialReactions={el.reactions}
                          userReaction={el.user_reaction}
                          setTopics={setData}
                          handleOnActionMenu={handleOnActionMenu}
                        />
                      </div>
                      
                    ))}
                    <TopicActionMenu
                      positionX={actionMenu.position.x}
                      positionY={actionMenu.position.y}
                      isToggled={actionMenu.toggled}
                      actionMenuRef={actionMenuRef}
                      resetActionMenu={resetActionMenu}
                      actionMenu={actionMenu}
                      onDeleteClick={handleDeleteClick}
                      handleTopicToUser={switchTopicToUser}
                      switchText={switchText}
                      handleShareClick={handleShareClick}
                    />
                    {isConfirmModalOpen ? (
                      <ConfirmationModal
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        message="Видалити цю тему?"
                      />
                    ) : null}
                    {isShareModalOpen ? (
                      <Share
                        onCloseModal={() => setShareModalOpen(false)}
                        url={`${location.origin}/topics/${shareId}`}
                      />
                    ): null}
                  </div>
                  
                ) : (
                  <AltSpinner />)}
            </div></> : (
              <div style = {{display: "flex", flexDirection: "column",  justifyContent: "center"}}>
                <div style = {{display: "flex",width: "100%", flexDirection:'row', justifyContent:"space-around",padding: "2vh"}}>
              <div style = {firstStepChoose === 0 ? {boxShadow: "0 0.3vh 0 0 #659287",fontSize: "2vh"} : {fontSize: "2vh"}}
              onClick = {()=>toChoose(0)}>Мої теми</div>
              <div style = {firstStepChoose !== 0 ? {boxShadow: "0 0.3vh 0 0 #659287" ,fontSize: "2vh"} : {fontSize: "2vh"}}
              onClick = {()=>{toChoose(1)}}>Збережені теми</div>
            </div>
                  <div style={{width: "100%",borderBottom: "1px solid black",paddingBottom: "2%", marginBottom: "4%" }}>
                    <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                      
                            {!firstStepChoose ? <Link style = {{width: "90%"}}
                            to={currentUser ? "/create-topic" : "/login"}
                            state={{
                              backgroundLocation: location,
                              redirectPath: "/create-topic",
                            }}
                          >
                            <button className="add-topic-button" style = {{width: "100%"}} >+ Додати тему</button>
                          </Link> : ''}
                          </div>
                        </div>
            <div style= {{display: "flex",justifyContent: "center",width: "100%"}}><div style={{width: "90%"}}><TopicList topicInfoList={data}  /></div></div>
            </div>)}
        </div> 
    </div>)
}

export default MyTopic