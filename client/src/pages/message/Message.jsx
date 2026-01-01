import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { useNotification } from "../../context/NotificationContext";
import "./Message.scss";

const Message = () => {
  
  const {id} = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const { addNotification } = useNotification();
  const messagesEndRef = useRef(null);

  const queryClient = useQueryClient();

  // Fetch messages
  const { isLoading, error, data } = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Fetch conversation details to get recipient info
  const { data: conversationData } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Get recipient ID based on current user role
  const recipientId = conversationData
    ? currentUser?.isSeller
      ? conversationData.buyerId
      : conversationData.sellerId
    : null;

  // Fetch recipient user details to get their username
  const { data: recipientData } = useQuery({
    queryKey: ["user", recipientId],
    queryFn: () =>
      newRequest.get(`/users/${recipientId}`).then((res) => {
        return res.data;
      }),
    enabled: !!recipientId, // Only fetch when we have a recipientId
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`,message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
      addNotification("Message sent successfully!", "success", 2000);
    },
    onError: () => {
      addNotification("Failed to send message. Please try again.", "error", 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageText = e.target[0].value.trim();
    
    if (!messageText) {
      addNotification("Please type a message before sending.", "warning", 2000);
      return;
    }

    mutation.mutate({
      conversationId: id,
      desc: messageText,
    });
    e.target[0].value = "";
  };

  return (
    <div className='message'>
      <div className="container">
        <span className='breadcrumbs'>
           <Link to="/messages">Messages</Link> ➤ {recipientData?.username || recipientId || "Loading..."} ➤
        </span>

        {isLoading ? "loading" :error ? "error" :
        <div className="messages">
          {
            data.map((m)=>(
              <div className={m.userId === currentUser._id ? "owner item " : "item"} key={m._id}>
                <img
                    src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt=""
                  />
                  <p>{m.desc}</p>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>}

          
        <form className="write" onSubmit={handleSubmit}>
          <textarea 
            type="text" 
            placeholder='write a message'
            disabled={mutation.isPending}
          ></textarea>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Message
