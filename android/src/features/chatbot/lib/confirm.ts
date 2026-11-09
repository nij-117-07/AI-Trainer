// src/features/chatbot/lib/confirm.ts
/** Asks before a destructive action. Uses a native alert on the device and a browser prompt on web. */
import { Alert, Platform } from "react-native";

export function confirmAction(title: string, message: string, onConfirm: () => void, confirmLabel = "Delete"): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
