# Solver objectives: current state and options

Written by an agent as a basis for discussion. Nothing here is decided.

## 1. What the solvers optimize today

### v1 (Go, `workshops-backend/src/main.go` + `min-cost-max-flow`)

`MinCostMaxFlow` runs successive shortest paths (Bellman-Ford on the residual graph) until no augmenting path is left. The result is a **minimum-cost flow among all maximum flows**, so the objective is lexicographic:

1. maximize the number of placed participants,
2. among those, minimize the sum of costs.

| Mode | Cost of wish index i (0-based) | Cost of unwished workshop |
|---|---|---|
| `/weighted` | i² (0, 1, 4, 9, …) | (k+1)², k = wishes per participant |
| `/unweighted` | 1 | (k+1)² |

The squared cost is convex. One 1st wish plus one 3rd wish (0+4) costs more than two 2nd wishes (1+1), so v1 already leans toward fairness. v1 returns exactly one solution.

### v2 (SCIP, `workshops-backend-v2/solver.py`)

v2 maximizes Σ w·x with w = k − index + 1 (k+1, …, 2; unwished = 1). Unweighted, every wished workshop scores 1, and so does every unwished one. The scores are linear (Borda). Being placed has no value of its own, so v2 trades placements against wish quality.

**Counterexample** (4 wishes, all capacities 1; A wants W1 as 1st wish and W2 as 4th, B wants W1 as 4th). Both backends were run on it locally:

| Solver | Result | Why |
|---|---|---|
| v1 | A→W2, B→W1 | maximum cardinality first |
| v2 | A→W1, B unassigned | 5 > 2 + 2 |

With k = 3 the same chain is a tie (4 = 2 + 2), so the outcome depends on the seed. `objectiveSlack > 0` admits such solutions more easily.

**Bug (v2):** with `useWeighted=false` and `allowAssignmentToNonWishedWorkshop=true`, wished and unwished workshops both score 1. A participant who wishes only W1 gets W1 or W2 with equal objective (confirmed locally). v1 does not have this problem.

## 2. One parametric objective

Each placement of participant p at rank r scores **B + u(r)**:

- **B** is a bonus for being placed at all.
- **u** gives the value of each wish rank (decreasing). Unwished workshops get a value u_unwished.

| Setting | Behaves like |
|---|---|
| B = 0, u linear | today's v2 |
| B large, u(r) = C − r² | today's v1 weighted |
| B large, u constant on wishes, lower on unwished | a correct unweighted mode (fixes the bug above) |

### Making SCIP reproduce v1 exactly

Let N be the number of placements (participants × workshops per participant) and Δ = u_max − u_min, with u_min including u_unwished. Compare an assignment that places c\* people (the maximum) with any assignment that places c ≤ c\*−1:

- the first scores at least c\*(B + u_min),
- the other scores at most (c\*−1)(B + u_max).

So **B > (N−1)·Δ − u_min** guarantees that more placements always win, and **B = N·Δ** is always enough. Every maximum-cardinality assignment then gets the same c\*·B, so u alone ranks them, which is exactly v1's order.

A two-phase solve is cleaner than a large B:

1. maximize the number of placements and get c\*,
2. add `placed ≥ c*` and maximize u.

This needs no large constants. Objective slack should then apply to the u part only. With a large B instead, 1 % slack on the total would quietly allow fewer people to be placed.

To match v1 exactly, also use u(r) = C − r² and v1's unwished cost (k+1)², which skips index k. Then check equivalence on random instances by comparing objective values, not assignments, because ties are broken differently. v1 should stay until this passes. After that it remains useful as a fast reference solver for the pure model.

## 3. Literature terms in B/u language

| Term | Optimizes | In B/u terms |
|---|---|---|
| Utilitarian / maximum-weight matching | sum of scores | B = 0, u linear (today's v2) |
| Maximum-weight maximum-cardinality matching | most placements, then sum | B lexicographic (today's v1) |
| Rank-maximal matching (Irving, Kavitha, Mehlhorn, Michail, Paluch 2004) | most 1st wishes, then most 2nd, … | B = 0, u falling extremely steeply. Prefers one 1st wish plus one unassigned over two 2nd wishes. "Top-heavy" extreme. |
| Fair matching (Huang, Kavitha, Michail, Nasre) | most placements, then fewest on the last rank, then the next-to-last, … | B lexicographic, costs (N+1)^r. "Fairness" extreme; v1's r² is a mild version. |
| Leximin / Rawlsian | best possible worst-off participant, then the next, … | essentially the fair matching when "unassigned" counts as the worst rank |
| Minimax rank (bottleneck) | worst rank only | coarse leximin; needs a tie-break on u |
| Pareto optimality | nobody can improve without someone else losing | minimum requirement, holds for strictly decreasing u with B + u > 0. The bug above breaks it. |
| Popular matching (Abraham, Irving, Kavitha, Mehlhorn 2007) | no other assignment wins a majority vote of the participants | ordinal, not expressible by B/u, may not exist. At most a quality check. |
| Strategy-proofness (e.g. Random Serial Dictatorship) | lying never pays | weight-based optimizers are not strategy-proof. Efficiency, strategy-proofness and equal treatment cannot all hold (Bogomolnaia & Moulin 2001). Mitigate, do not expect elimination. |

**Fairness slider.** The family u(r) = −r^p covers the range between the two extremes:

| Dot | p | Behaves like |
|---|---|---|
| 1 | p → 0 | rank-maximal |
| 2 | p ≈ ½ | |
| 3 | p = 1 | utilitarian, today's v2 |
| 4 | p = 2 | today's v1 |
| 5 | p → ∞ | fair / leximin |

Implement the extreme dots as multi-phase lexicographic solves, not as exponential weights. Those would reach about 10¹³ at 150 participants and 6 wishes, which is numerically fragile.

## 4. Unwished workshops and truncated wish lists

How should u_unwished be chosen?

- **(a) Global:** u_unwished = u(k+1). This is what both solvers do today. It rewards listing fewer wishes than allowed: a participant with one wish is protected strongly, because their fallback looks very bad.
- **(b) Per participant:** u_unwished = u(f+1), where f = the number of wishes the participant actually filled in. A truncator who misses their only wish then counts like someone else's 2nd wish. This removes most of the advantage without punishing anyone.
- **(c) A separate fixed value** set by the organizer.

Truncation can be honest ("I really only want chess"), so neutralizing the advantage with (b) seems safer than punishing it.

## 5. Further objective terms

- **Workshop load:** λ · Σ underfill, absolute or relative to capacity, as a third weighted term. Quiz form: "Is a half-empty workshop worse than one person getting a worse wish?"
- These terms belong in v2 only. Anything beyond B + u breaks v1's flow model.

## 6. Quiz sketch

The goal is to set B, u, u_unwished and λ without math. It recommends defaults, and a flow chart lies behind it (possibly shown at the end). Each comparison shows two small, concrete assignments. Rough order:

1. Do wish ranks matter? (Recommended: yes, i.e. weighted.)
2. May someone go to a workshop they did not wish for? If yes:
   - Is an unwished workshop better than none? (Usually yes, so B > −u_unwished.)
   - How to treat short wish lists: option (b) recommended.
3. Placement against wishes: "Would you move N people one wish down so one more person gets a place?" Recommended: always, i.e. lexicographic B.
4. Fairness against average happiness: "1× 1st + 1× 3rd, or 2× 2nd?", then the 5-dot slider with a live example that updates while dragging.
5. Workshop load: does an empty or thin workshop matter, and how much?

Open questions: the final order, which answers make later questions irrelevant (e.g. 2 is skipped when unwished is off), and whether the flow chart is shown to the user.

## 7. Later topics (need their own planning; all SCIP-only)

- Minimum capacities (a workshop runs with ≥ m people or not at all)
- Phases with different workshops and capacities
- Hybrid live assignment: fix some assignments by hand, solve the rest
- A menu of side conditions translated to SCIP, hard or soft (constraint or objective term). Examples: even group sizes, "A and B not together", if-then rules.
- A dedicated admin dashboard separate from the main site
