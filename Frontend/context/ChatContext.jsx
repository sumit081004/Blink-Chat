import { useContext, useEffect } from "react";
import { children, createContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children})=>{

    const[messages, setMessages] = useState({});
    const[users, setUsers] = useState([]);
    const[selectedUser, setSelectedUser] = useState(null)
    const[unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);

    //function to get all users for sidebar
    const getUsers = async ()=> {
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    // function to get message for selected user

    const getMessages = async (userId) => {
  try {
    const { data } = await axios.get(`/api/messages/${userId}`);
    if (data.success) {
      setMessages((prev) => {
        const existing = prev[userId] || [];
        const fetched = data.message || [];

        const allMessages = [
          ...fetched,
          ...existing.filter((msg) => !fetched.some((fm) => fm._id === msg._id))
        ];

        return {
          ...prev,
          [userId]: allMessages
        };
      });
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


    //function to send message to selected user
    const sendMessage = async (messageData)=>{
         try {
    const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
    if (data.success) {
      setMessages((prev) => ({
        ...prev,
        [selectedUser._id]: [
          ...(prev[selectedUser._id] || []),
          data.newMessage
        ]
      }));
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
    
    }

//fuction to subscribe to messages for selected user
const subscribeToMessages = async ()=>{
    if(!socket) return;

   socket.on("newMessage", (newMessage) => {
  setMessages((prev) => ({
    ...prev,
    [newMessage.senderId]: [
      ...(prev[newMessage.senderId] || []),
      newMessage
    ]
  }));

  if (selectedUser && newMessage.senderId === selectedUser._id) {
    axios.put(`/api/messages/mark/${newMessage._id}`);
  } else {
    setUnseenMessages((prev) => ({
      ...prev,
      [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
    }));
  }
});
}

 //function to unsubscribe from messages
 const unsubscribeFromMessages = ()=>{
    if(socket) socket.off("newMessage");

 }

 useEffect(()=>{
    subscribeToMessages();
    return ()=> unsubscribeFromMessages();
 },[socket, selectedUser])

    const value ={
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages, setMessages

    }
    return(
        <ChatContext.Provider value={value}>
            { children }
        </ChatContext.Provider>
    )
}