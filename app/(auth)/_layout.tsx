import useAuthBear from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

const assetId = require("@/assets/videos/intro.mp4");

export default function _Layout() {
  const { isAuthenticated } = useAuthBear();

  if(isAuthenticated) return <Redirect href="/"/>

  const player = useVideoPlayer(assetId, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <VideoView
          contentFit="cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          player={player}
          allowsFullscreen
          
        />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-start pl-2.5 pt-20">
            <View className="mt-0 p-5">
              <Text className="text-4xl text-white font-black">CAMBIA LA FORMA DE CONTROLAR TUS FINANZAS</Text>
            </View>
          </View>
          <Slot />
        </ScrollView>

        
      </View>
    </KeyboardAvoidingView>
  );
}
