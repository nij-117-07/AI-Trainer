// src/app/practice/socratic/index.tsx
import { useCallback, useState } from "react";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocraticChatHeader } from "@/features/socratic/components/SocraticChatHeader";
import { SocraticChatView } from "@/features/socratic/components/SocraticChatView";
import { useSocraticChat } from "@/features/socratic/hooks/useSocraticChat";
import { useThemeColors } from "@/theme";

export default function SocraticRoute() {
  const chat = useSocraticChat();
  const colors = useThemeColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pending, stop } = chat;

  useFocusEffect(
    useCallback(() => {
      // Escape or back stops a running reply first, then closes the menu.
      function dismiss(): boolean {
        if (pending) {
          stop();
          return true;
        }
        if (menuOpen) {
          setMenuOpen(false);
          return true;
        }
        return false;
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
    }, [pending, stop, menuOpen]),
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
      <SocraticChatHeader onNewChat={chat.reset} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <SocraticChatView chat={chat} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
