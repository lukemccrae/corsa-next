"use client";
import React from "react";
import DiscordHelpButton from "@/src/components/DiscordHelpButton";

export default function BurritoLeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <DiscordHelpButton inviteUrl="https://discord.gg/your-burrito-league-invite" />
    </>
  );
}
