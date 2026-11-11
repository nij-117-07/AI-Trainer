// src/features/chatbot/components/MessageList.tsx
/** Scrolling list of the open chat. Keeps the newest text in view while a reply streams in. */
import { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { spacing } from "@/theme";
import type { ChatMessage, Persona } from "../types";
import { MessageBubble, type SpeechControls } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  persona: Persona;
  sending: boolean;
  onRegenerate: () => void;
  speech: SpeechControls;
}

export function MessageList({ messages, persona, sending, onRegenerate, speech }: MessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lastIndex = messages.length - 1;

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      accessibilityRole="log"
      accessibilityLabel="Conversation"
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: !sending })}
      renderItem={({ item, index }) => (
        <MessageBubble
          message={item}
          persona={persona}
          isLast={index === lastIndex}
          canRegenerate={!sending}
          onRegenerate={onRegenerate}
          speech={speech}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
});
