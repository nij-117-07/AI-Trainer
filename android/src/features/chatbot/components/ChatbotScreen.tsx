// src/features/chatbot/components/ChatbotScreen.tsx
/** Chat page: header with chats, persona, and new chat; the conversation; and the composer with voice input. */
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Menu, SquarePen } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useChatbot } from "../hooks/useChatbot";
import { useReplySpeech } from "../hooks/useReplySpeech";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { confirmAction } from "../lib/confirm";
import { appendTranscript, formatElapsed } from "../lib/voice-text";
import { ChatDrawer } from "./ChatDrawer";
import { Composer } from "./Composer";
import { EmptyChat } from "./EmptyChat";
import { MessageList } from "./MessageList";
import { PersonaAvatar } from "./PersonaAvatar";
import { PersonaSwitcher } from "./PersonaSwitcher";

export function ChatbotScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const chat = useChatbot();
  const speech = useReplySpeech();
  const voice = useVoiceInput((text) => chat.setDraft((prev) => appendTranscript(prev, text)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (!chat.settings.autoSpeak || !chat.lastReplyId) return;
    const reply = chat.messages.find((m) => m.id === chat.lastReplyId);
    if (reply && reply.content.trim()) void speech.speak(reply.id, reply.content);
  }, [chat.lastReplyId]);

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/tools");
  };

  if (!chat.loaded) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const persona = chat.activePersona;
  if (!persona) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>No persona is available yet.</Text>
          <Pressable onPress={() => router.push("/admin/chatbot")} accessibilityRole="button">
            <Text style={[styles.link, { color: colors.primary }]}>Create one in Chatbot Admin</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const send = () => {
    speech.stop();
    void chat.send();
  };

  const startNewChat = () => {
    speech.stop();
    chat.startNewChat();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <IconButton label="Go back" onPress={back}>
          <ArrowLeft size={18} color={colors.foreground} />
        </IconButton>
        <IconButton label="Open chats" onPress={() => setDrawerOpen(true)}>
          <Menu size={18} color={colors.foreground} />
        </IconButton>
        <Pressable
          onPress={() => setSwitcherOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Persona ${persona.name}. Change persona`}
          style={({ pressed }) => [styles.personaChip, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <PersonaAvatar emoji={persona.avatar} size={24} />
          <Text numberOfLines={1} style={[styles.personaName, { color: colors.foreground }]}>
            {persona.name}
          </Text>
          <ChevronDown size={16} color={colors.mutedForeground} />
        </Pressable>
        <IconButton label="New chat" onPress={startNewChat}>
          <SquarePen size={18} color={colors.foreground} />
        </IconButton>
      </View>

      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {chat.messages.length === 0 ? (
          <EmptyChat persona={persona} onPick={chat.setDraft} />
        ) : (
          <MessageList
            messages={chat.messages}
            persona={persona}
            sending={chat.sending}
            onRegenerate={chat.regenerate}
            speech={{
              ready: speech.ready,
              activeId: speech.activeId,
              loadingId: speech.loadingId,
              onSpeak: (id, text) => void speech.speak(id, text),
              onStop: speech.stop,
            }}
          />
        )}

        {voice.recording ? (
          <Text style={[styles.status, { color: colors.destructive }]}>
            Recording {formatElapsed(voice.elapsedMs)}. Tap the red button to finish.
          </Text>
        ) : voice.transcribing ? (
          <Text style={[styles.status, { color: colors.mutedForeground }]}>Transcribing your voice…</Text>
        ) : null}

        {speech.error || voice.error || chat.error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
            {voice.error ?? speech.error ?? chat.error}
          </Text>
        ) : null}

        <View style={styles.composerWrap}>
          <Composer
            value={chat.draft}
            onChangeText={chat.setDraft}
            onSend={send}
            onStop={chat.stop}
            sending={chat.sending}
            placeholder={`Message ${persona.name}`}
            voice={{
              ready: voice.ready,
              recording: voice.recording,
              transcribing: voice.transcribing,
              onToggle: () => void voice.toggle(),
            }}
          />
        </View>
      </KeyboardAvoidingView>

      <ChatDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        threads={chat.personaThreads}
        activeThreadId={chat.activeThreadId}
        personaName={persona.name}
        onNewChat={() => {
          startNewChat();
          setDrawerOpen(false);
        }}
        onOpen={(id) => {
          speech.stop();
          void chat.openThread(id);
          setDrawerOpen(false);
        }}
        onDelete={(id) =>
          confirmAction("Delete this chat?", "It will be removed from this device.", () => {
            void chat.deleteThread(id);
          })
        }
      />

      <PersonaSwitcher
        visible={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        personas={chat.personas}
        activeId={persona.id}
        onSelect={(id) => {
          speech.stop();
          chat.selectPersona(id);
          setSwitcherOpen(false);
        }}
        onManage={() => {
          setSwitcherOpen(false);
          router.push("/admin/chatbot");
        }}
      />
    </SafeAreaView>
  );
}

function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  iconButton: {
    height: 40,
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  personaChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 40,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  personaName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    flex: 1,
  },
  composerWrap: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  status: {
    fontSize: 13,
    textAlign: "center",
    paddingBottom: spacing.xs,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  hint: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
  },
});
