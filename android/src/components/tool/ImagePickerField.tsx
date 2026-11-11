// src/components/tool/ImagePickerField.tsx
/**
 * Picks one image from the device library, resizes it to at most 1024px, and shows a preview.
 * The resized image is sent to the model as base64 JPEG.
 */
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { resizeImage, type ImageInput } from "@/lib/image";
import { ErrorText, Field } from "@/components/tool/FormControls";

interface ImagePickerFieldProps {
  value: ImageInput | null;
  onChange: (image: ImageInput | null) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  /** Names the picture in screen-reader labels, for example "answer image" or "photo". */
  noun?: string;
}

export function ImagePickerField({
  value,
  onChange,
  disabled = false,
  label = "Image (optional)",
  hint = "PNG, JPG, or WEBP: a handwritten answer, diagram, or screenshot.",
  noun = "image",
}: ImagePickerFieldProps) {
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
    <Field label={label} hint={hint}>
      {value ? (
        <View style={[styles.preview, { borderColor: colors.border }]}>
          <Image source={{ uri: value.uri }} style={styles.image} resizeMode="contain" accessibilityLabel={`Attached ${noun}`} />
          <Pressable
            onPress={() => onChange(null)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${noun}`}
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
          accessibilityLabel={`Choose ${noun}`}
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
    borderRadius: shape.lg,
    paddingVertical: spacing.lg,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  preview: {
    borderWidth: 1,
    borderRadius: shape.lg,
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
    width: 44,
    height: 44,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
