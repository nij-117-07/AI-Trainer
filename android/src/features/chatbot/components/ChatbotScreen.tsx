// src/features/chatbot/components/ChatbotScreen.tsx
/** Chat page: header with chats, persona, and new chat; the conversation; and the composer with voice input. */
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Menu, SquarePen } from "lucide-react-native";
import { contentWidth, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { useChatbot } from "../hooks/useChatbot";
import { useReplySpeech } from "../hooks/useReplySpeech";
import { useVoiceInput } from "../hooks/useVoiceInput";
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
  const { size } = useLayout();
  const chat = useChatbot();
  const speech = useReplySpeech();
  const voice = useVoiceInput((text) => chat.setDraft((prev) => appendTranscript(prev, text)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const docked = size === "desktop";

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
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading chat" />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Loading chat…</Text>
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
          <Pressable
            onPress={() => router.push("/admin/chatbot")}
            accessibilityRole="button"
            accessibilityLabel="Create a persona in Chatbot Admin"
            style={({ pressed }) => [styles.linkButton, pointerCursor, pressed && { opacity: 0.7 }]}
          >
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

  const errors = [voice.error, speech.error, chat.error].filter(
    (text, index, all): text is string => Boolean(text) && all.indexOf(text) === index,
  );

  const startNewChat = () => {
    speech.stop();
    chat.startNewChat();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.frame, docked && styles.frameDesktop]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <IconButton label="Go back" onPress={back}>
            <ArrowLeft size={18} color={colors.foreground} />
          </IconButton>
          {docked ? null : (
            <IconButton label="Open chats" onPress={() => setDrawerOpen(true)}>
              <Menu size={18} color={colors.foreground} />
            </IconButton>
          )}
          <Pressable
            onPress={() => setSwitcherOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Change persona. Current persona: ${persona.name}`}
            style={({ pressed }) => [
              styles.personaChip,
              pointerCursor,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.muted },
            ]}
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

        <View style={styles.split}>
          <ChatDrawer
            docked={docked}
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
            onDelete={(id) => {
              chat.deleteThread(id);
              setDrawerOpen(false);
            }}
          />

          <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.column}>
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
                <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.destructive }]}>
                  Recording {formatElapsed(voice.elapsedMs)}. Tap the mic to stop.
                </Text>
              ) : voice.transcribing ? (
                <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
                  Transcribing your voice…
                </Text>
              ) : null}

              {errors.map((text) => (
                <Text key={text} accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
                  {text}
                </Text>
              ))}

              {chat.pendingDelete ? (
                <View style={styles.snackbarAnchor}>
                  <UndoSnackbar
                    message={`Deleted chat ${chat.pendingDelete.title}`}
                    onUndo={chat.undoDelete}
                    onDismiss={() => void chat.commitDelete()}
                  />
                </View>
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
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>

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
      style={({ pressed }) => [
        styles.iconButton,
        pointerCursor,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  frame: {
    flex: 1,
  },
  frameDesktop: {
    width: "100%",
    maxWidth: contentWidth.wide,
    alignSelf: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
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
    height: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: spacing.sm,
    borderRadius: shape.full,
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
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
  },
  personaName: {
    ...typeScale.body,
    flexShrink: 1,
    fontWeight: "600",
  },
  split: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: "100%",
    maxWidth: contentWidth.form,
    alignSelf: "center",
  },
  composerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  status: {
    ...typeScale.caption,
    textAlign: "center",
    paddingBottom: spacing.xs,
  },
  error: {
    ...typeScale.label,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  snackbarAnchor: {
    height: 0,
  },
  hint: {
    ...typeScale.body,
  },
  linkButton: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  link: {
    ...typeScale.body,
    fontWeight: "600",
  },
});
