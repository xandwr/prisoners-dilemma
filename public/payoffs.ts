import { Choice } from "@/types";

export const payoff_matrix: Record<Choice, Record<Choice, [number, number]>> = {
    "Cooperate": {
        "Cooperate": [3, 3],
        "Defect": [0, 5]
    },
    "Defect": {
        "Cooperate": [5, 0],
        "Defect": [1, 1]
    }
}