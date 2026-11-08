// src/features/testing-portal/components/ImagePickerField.tsx
/**
 * Picks one image from the device library, resizes it to at most 1024px, and shows a preview.
 * The resized image is sent to the model as base64 JPEG.
 */
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { resizeImage } from "../lib/image";
import type { ImageInput } from "../types";
import { ErrorText, Field } from "./FormControls";

interface ImagePickerFieldProps {
  value: ImageInput | null;
  onChange: (image: ImageInput | null) => void;
  disabled?: boolean;
}

export function ImagePickerField({ value, onChange, disabled = false }: ImagePickerFieldProps) {
  const colors = useThemeColors();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = disabled || processing;

  async function pick() {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setProcessing(true);
      onChange(await resizeImage({ uri: asset.uri, width: asset.width, height: asset.height }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the image.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Field label="Answer image (optional)" hint="PNG, JPG, or WEBP: a handwritten answer, diagram, or screenshot.">
      {value ? (
        <View style={[styles.preview, { borderColor: colors.border }]}>
          <Image source={{ uri: value.uri }} style={styles.image} resizeMode="contain" accessibilityLabel="Attached answer image" />
          <Pressable
            onPress={() => onChange(null)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Remove image"
            style={[styles.remove, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <X size={16} color={colors.foreground} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Choose answer image"
          style={({ pressed }) => [
            styles.picker,
            { borderColor: colors.border, backgroundColor: colors.background },
            pressed && { backgroundColor: colors.muted },
            busy && { opacity: 0.6 },
          ]}
        >
          {processing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <ImagePlus size={18} color={colors.primary} />
          )}
          <Text style={[styles.pickerText, { color: colors.foreground }]}>
            {processing ? "Preparing image…" : "Choose image"}
          </Text>
        </Pressable>
      )}
      <ErrorText message={error} />
    </Field>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  preview: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220,
  },
  remove: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
