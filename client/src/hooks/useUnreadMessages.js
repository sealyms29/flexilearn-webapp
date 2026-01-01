import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";

/**
 * Hook to fetch unread message count
 * Returns the count of unread conversations for the current user
 */
export const useUnreadMessagesCount = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => res.data),
    enabled: !!currentUser,
    refetchInterval: 10000, // Refetch every 10 seconds for new messages
  });

  // Count unread conversations based on user role
  const unreadCount = conversations.filter((c) => {
    if (currentUser?.isSeller) {
      return !c.readBySeller;
    } else {
      return !c.readByBuyer;
    }
  }).length;

  return unreadCount;
};

/**
 * Hook to format unread badge text
 * Returns badge text or empty string if no unread messages
 */
export const useUnreadBadge = () => {
  const unreadCount = useUnreadMessagesCount();
  return unreadCount > 0 ? unreadCount.toString() : "";
};
