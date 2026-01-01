import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { useNotification } from "../../context/NotificationContext";
import "./Messages.scss";
import moment from "moment";

// Component to display username for each conversation
const ConversationRow = ({ conversation, currentUser, onRead }) => {
  const otherUserId = currentUser.isSeller ? conversation.buyerId : conversation.sellerId;
  
  const { data: userData } = useQuery({
    queryKey: ["user", otherUserId],
    queryFn: () =>
      newRequest.get(`/users/${otherUserId}`).then((res) => {
        return res.data;
      }),
  });

  const isUnread = (currentUser.isSeller && !conversation.readBySeller) ||
    (!currentUser.isSeller && !conversation.readByBuyer);

  return (
    <tr className={isUnread && "active"} key={conversation.id}>
      <td>{userData?.username || otherUserId}</td>
      <td>
        <Link to={`/message/${conversation.id}`} className="link">
          {conversation?.lastMessage?.substring(0, 100)}...
        </Link>
      </td>
      <td>{moment(conversation.updatedAt).fromNow()}</td>
      <td>
        {isUnread && (
          <button onClick={() => onRead(conversation.id)}>
            Mark as Read
          </button>
        )}
      </td>
    </tr>
  );
};

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const { addNotification } = useNotification();

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
      addNotification("Conversation marked as read", "success", 2000);
    },
    onError: () => {
      addNotification("Failed to mark conversation as read", "error", 3000);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <table>
            <tr>
              <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
              <th>Last Message</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
            {data.map((c) => (
              <ConversationRow 
                key={c.id}
                conversation={c} 
                currentUser={currentUser} 
                onRead={handleRead}
              />
            ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;