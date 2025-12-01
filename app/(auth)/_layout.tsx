import useAuthBear from "@/store/auth.store";
import { Redirect, Stack } from "expo-router";
import { useVideoPlayer } from "expo-video";
import React from "react";

const assetId = require("@/assets/videos/intro.mp4");

export default function _Layout() {
  const { isAuthenticated } = useAuthBear();

  if(isAuthenticated) return <Redirect href="/"/>

  const player = useVideoPlayer(assetId, (player) => {
    player.loop = true;
    player.play();
  });

   return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
   );
}
