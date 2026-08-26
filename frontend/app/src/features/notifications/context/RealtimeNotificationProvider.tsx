import { useEffect, useRef, useState, type ReactNode } from "react";
import notificationSound from "../../../assets/sounds/notification.mp3";
import { apiWebSocketUrl } from "../../../shared/api/httpClient";
import { clearAuthSession, getAuthToken, onAuthChange } from "../../auth/model/authSession";
import NotificationToastQueue from "../components/NotificationToastQueue";
import type { OrderNotification, ToastNotification } from "../model/notificationTypes";

const notificationWebSocketUrl = `${apiWebSocketUrl}/ws/notifications`;
const toastDurationMs = 5000;

export default function RealtimeNotificationProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [queue, setQueue] = useState<ToastNotification[]>([]);
  const playedNotifications = useRef(new Set<string>());
  const activeNotification = queue[0];

  useEffect(() => onAuthChange(() => {
    const nextToken = getAuthToken();
    setToken(nextToken);
    if (!nextToken) setQueue([]);
  }), []);

  useEffect(() => {
    if (!token) return;

    let active = true;
    let socket: WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let reconnectDelay = 3000;

    const connect = () => {
      socket = new WebSocket(notificationWebSocketUrl);
      socket.onopen = () => {
        reconnectDelay = 3000;
        socket?.send(JSON.stringify({ token }));
      };
      socket.onmessage = (message) => {
        try {
          const notification = JSON.parse(message.data) as OrderNotification;
          if (!notification.type || !notification.orderId || !notification.orderNumber) return;

          setQueue((current) => [
            ...current,
            { ...notification, id: crypto.randomUUID() },
          ]);
        } catch {
          // Ignore malformed messages and keep the realtime connection alive.
        }
      };
      socket.onclose = (event) => {
        if (!active) return;
        if (event.code === 1008) {
          clearAuthSession();
          return;
        }
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      };
    };

    connect();
    return () => {
      active = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token]);

  useEffect(() => {
    if (!activeNotification) return;

    if (!playedNotifications.current.has(activeNotification.id)) {
      playedNotifications.current.add(activeNotification.id);
      const audio = new Audio(notificationSound);
      audio.volume = 0.65;
      void audio.play().catch(() => undefined);
    }

    const timeout = window.setTimeout(() => {
      setQueue((current) => current.slice(1));
    }, toastDurationMs);
    return () => window.clearTimeout(timeout);
  }, [activeNotification]);

  return (
    <>
      {children}
      <NotificationToastQueue
        notification={activeNotification}
        waitingCount={Math.max(0, queue.length - 1)}
        onDismiss={() => setQueue((current) => current.slice(1))}
      />
    </>
  );
}
