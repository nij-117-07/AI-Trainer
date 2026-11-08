// src/features/vision-converter/components/ImageDropField.tsx
/**
 * Picks one image from the device library, resizes it on the device, and shows a preview. The
 * shared ImagePickerField is labelled for the grader's optional answer image, so this tool has
 * its own label and hint with the same behaviour.
 */
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { resizeImage, type ImageInput } from "@/lib/image";
import { ErrorText, Field } from "@/components/tool/FormControls";

interface ImageDropFieldProps {
  value: ImageInput | null;
  onChange: (image: ImageInput | null) => void;
  disabled?: boolean;
}

export function ImageDropField({ value, onChange, disabled = false }: ImageDropFieldProps) {
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
    <Field label="Image" hint="PNG, JPG, or WEBP. Resized on the device before it is sent to the model.">
      {value ? (
        <View style={[styles.preview, { borderColor: colors.border }]}>
          <Image source={{ uri: value.uri }} style={styles.image} resizeMode="contain" accessibilityLabel="Selected image" />
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
          accessibilityLabel="Choose image"
          style={({ pressed }) => [
            styles.picker,
            { borderColor: colors.border, backgroundColor: colors.background },
            pressed && { backgroundColor: colors.muted },
            busy && { opacity: 0.6 },
          ]}
        >
          {processing ? <ActivityIndicator color={colors.primary} /> : <ImagePlus size={18} color={colors.primary} />}
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
