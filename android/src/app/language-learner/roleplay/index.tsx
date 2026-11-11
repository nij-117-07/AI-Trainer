import { useCallback } from "react";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme";
import { RoleplayChatHeader } from "@/features/roleplay/components/RoleplayChatHeader";
import { RoleplayChatView } from "@/features/roleplay/components/RoleplayChatView";
import { useRoleplayChat } from "@/features/roleplay/hooks/useRoleplayChat";
import { useRoleplayRoles } from "@/features/roleplay/hooks/useRoleplayRoles";
import { scenarioOf } from "@/features/roleplay/lib/text";

export default function RoleplayChatRoute() {
  const colors = useThemeColors();
  const chat = useRoleplayChat();
  const roles = useRoleplayRoles();
  const { reload } = roles;
  const { pending, stop } = chat;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useFocusEffect(
    useCallback(() => {
      // Escape or back stops a running reply first.
      function dismiss(): boolean {
        if (!pending) return false;
        stop();
        return true;
      }

      if (Platform.OS === "web") {
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key !== "Escape" || !dismiss()) return;
          event.preventDefault();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", dismiss);
      return () => subscription.remove();
    }, [pending, stop]),
  );

  const role = roles.roles.find((item) => item.prompt === chat.settings.systemPrompt);
  const scenario = scenarioOf(chat.settings.systemPrompt) || "No persona yet";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
      <RoleplayChatHeader name={role?.name ?? "Roleplay"} scenario={scenario} onNewChat={chat.newConversation} />
      <RoleplayChatView chat={chat} name={role?.name ?? "Persona"} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
