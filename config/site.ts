import { strategies, getStrategyByKey } from "@/public/strategies";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "The Prisoner's Dilemma",
	description: "Simulating the classic game theory thought experiment using Next.js",
	defaultRounds: 10,
	player1DefaultStrategy: getStrategyByKey(strategies, "unconditional-cooperate"),
	player2DefaultStrategy: getStrategyByKey(strategies, "tit-for-tat"),
};
