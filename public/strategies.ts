import { Choice } from "@/types";

interface Strategy {
    key: string;
    label: string;
    description: string;
    decide: (opponentHistory: Choice[], ownHistory: Choice[]) => Choice;
}

export function getStrategyByKey(strategies: Strategy[], key: string): Strategy {
    let strategy = strategies.find(s => s.key === key);
    return strategy !== undefined ? strategy : strategies[0];
}

export const strategies: Strategy[] = [
    {
        key: "unconditional-cooperate", 
        label: "Always Cooperate",
        description: "The player will always cooperate, regardless of the opponent's previous choices.",
        decide: (): Choice => "Cooperate" // Always returns "Cooperate"
    },
    {
        key: "unconditional-defect", 
        label: "Always Defect",
        description: "The player will always defect, regardless of the opponent's previous choices.",
        decide: (): Choice => "Defect" // Always returns "Defect"
    },
    {
        key: "tit-for-tat",
        label: "Tit for Tat",
        description: "The player cooperates in the first round and then mirrors the opponent's previous move in subsequent rounds.",
        decide: (opponentHistory: Choice[]): Choice => { 
            if (opponentHistory.length === 0) {
                return "Cooperate"; // Cooperate on the first round
            } else {
                return opponentHistory[opponentHistory.length - 1]; // Mirror the opponent's last choice
            }
        }
    },
    {
        key: "random",
        label: "Random",
        description: "The player randomly chooses to cooperate or defect in each round.",
        decide: (): Choice => Math.random() < 0.5 ? "Cooperate" : "Defect"
    },
    {
        key: "grim-trigger",
        label: "Grim Trigger",
        description: "The player starts by cooperating and continues to cooperate unless the opponent defects, after which it always defects.",
        decide: (opponentHistory: Choice[]): Choice => {
            return opponentHistory.includes("Defect") ? "Defect" : "Cooperate";
        }
    },
    {
        key: "pavlov",
        label: "Pavlov (Win-Stay Lose-Shift)",
        description: "The player cooperates if the opponent's last move was the same as its own previous move, and defects otherwise.",
        decide: (opponentHistory: Choice[], ownHistory: Choice[]): Choice => {
            const lastMove = ownHistory[ownHistory.length - 1] || "Cooperate"; // Start with Cooperate if no previous move
            return lastMove === (opponentHistory[opponentHistory.length - 1] || "Cooperate") ? "Cooperate" : "Defect";
        }
    },
    {
        key: "suspicious-tit-for-tat",
        label: "Suspicious Tit for Tat",
        description: "Similar to Tit for Tat, but starts by defecting and then mirrors the opponent's previous move.",
        decide: (opponentHistory: Choice[]): Choice => {
            if (opponentHistory.length === 0) {
                return "Defect"; // Defect on the first round
            } else {
                return opponentHistory[opponentHistory.length - 1]; // Mirror the opponent's last choice
            }
        }
    },
    {
        key: "forgiving-tit-for-tat",
        label: "Forgiving Tit for Tat",
        description: "Similar to Tit for Tat, but forgives the opponent's occasional defection by cooperating after a certain number of consecutive mutual cooperations.",
        decide: (opponentHistory: Choice[], ownHistory: Choice[]): Choice => {
            const consecutiveCooperations = ownHistory.reduceRight((acc: number, move: Choice): number => {
                if (move === "Cooperate") {
                    acc++;
                } else {
                    return acc;
                }
                return acc;
            }, 0);
            if (consecutiveCooperations >= 2) {
                return "Cooperate"; // Forgive and cooperate after 2 or more consecutive mutual cooperations
            } else {
                return opponentHistory[opponentHistory.length - 1]; // Mirror the opponent's last choice
            }
        }
    }
];
