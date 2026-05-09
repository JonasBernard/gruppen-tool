package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/JonasBernard/min-cost-max-flow/matching"
)

type MatchNode[L any, R any] struct {
	Name       string
	IsRight    bool
	IsSource   bool
	IsSink     bool
	LeftValue  L
	RightValue R
}

func (n MatchNode[L, R]) String() string {
	return n.Name
}

type Participant struct {
	Name   string    `json:"name"`
	Wishes [6]string `json:"wishes"`
	Id     string    `json:"id"`
}

func (c Participant) String() string {
	return c.Name
}

func (w Workshop) String() string {
	return fmt.Sprintf("%v (cap %v)", w.Name, w.Capacity)
}

type Workshop struct {
	Name     string `json:"name"`
	Capacity int    `json:"capacity,string"`
}

type SentWishes struct {
	Participants []Participant
	Workshops    []Workshop
	Settings     Settings `json:"settings,omitempty"`
}

type Settings struct {
	AllowAssignmentToNonWishedWorkshop bool `json:"allowAssignmentToNonWishedWorkshop"`
	NumberOfWishesPerParticipant       int  `json:"numberOfWishesPerParticipant"`
}

type ResponseSolution struct {
	Solutions []Assignment `json:"solutions"`
	Status    string       `json:"status"`
}

type Assignment struct {
	Assignment [][]string `json:"assignment"`
}

func AllowOriginLocalhost(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func AddDefaultHeader(w *http.ResponseWriter) {
	headers := (*w).Header()
	headers.Add("Vary", "Origin")
	headers.Add("Vary", "Access-Control-Request-Method")
	headers.Add("Vary", "Access-Control-Request-Headers")
	headers.Add("Access-Control-Allow-Headers", "Content-Type, Origin, Accept, token")
	headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS")
}

func NormalizeString(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}

func Weighted() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		SolveGroupProblem(w, r, func(i int) float64 {
			return float64(i * i)
		})
	}
}

func Unweighted() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		SolveGroupProblem(w, r, func(i int) float64 {
			return 1
		})
	}
}

func constructSolutionResponse(participants []Participant, matchingEdges []matching.MatchingEdge[Participant, Workshop]) ResponseSolution {
	solution := make([][]string, len(participants))

	for i, participant := range participants {
		solution[i] = []string{participant.Name}
	}

	for _, edge := range matchingEdges {
		p := edge.Left
		w := edge.Right

		for i, participant := range participants {
			if participant.Name == p.Name {
				solution[i] = append(solution[i], w.Name)
			}
		}
	}

	for i, _ := range participants {
		if len(solution[i]) == 1 {
			solution[i] = append(solution[i], "none")
		}
	}

	return ResponseSolution{
		Solutions: []Assignment{{Assignment: solution}},
	}
}

func SolveGroupProblem(w http.ResponseWriter, req *http.Request, getEdgeWeight func(int) float64) {
	AllowOriginLocalhost(&w)
	AddDefaultHeader(&w)

	var wished SentWishes

	if req.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if req.Method != "POST" {
		http.Error(w, "Allowed Methods: [POST]", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(req.Body)

	defer req.Body.Close()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &wished)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	participants := wished.Participants

	if len(participants) > 150 {
		http.Error(w, "Number of participants must be at most 150.", http.StatusBadRequest)
		return
	}

	workshops := wished.Workshops

	allowAssignmentToNonWishedWorkshop := wished.Settings.AllowAssignmentToNonWishedWorkshop
	numberOfWishesPerParticipant := wished.Settings.NumberOfWishesPerParticipant

	matchingProblem := matching.MatchingProblem[Participant, Workshop]{
		Lefts:  participants,
		Rights: workshops,
	}

	solutions, err := matchingProblem.SolveMany(1, func(c Participant, w Workshop) (connect bool, weight float64) {
		for j := 0; j < numberOfWishesPerParticipant; j++ {
			wi := c.Wishes[j]

			if NormalizeString(wi) == NormalizeString(w.Name) {
				return true, getEdgeWeight(j)
			}
		}

		// if false, 10 will be ignored
		return allowAssignmentToNonWishedWorkshop, float64((numberOfWishesPerParticipant + 1) * (numberOfWishesPerParticipant + 1))
	}, func(w Workshop) (capacity float64) {
		return float64(w.Capacity)
	})

	if len(solutions) < 1 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	matchingEdges := solutions[0]

	response := constructSolutionResponse(participants, matchingEdges)

	if err != nil {
		fmt.Printf("%v\n", err)
		if strings.HasPrefix(err.Error(), "there is no perfect solution.") {
			response.Status = "no-perfect-solution"
		} else {
			response.Status = "error-unknown"
		}
	} else {
		response.Status = "ok"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func main() {
	fmt.Println("Go server: Workshops-Backend started. Listening on :5000")

	http.HandleFunc("/weighted", Weighted())
	http.HandleFunc("/unweighted", Unweighted())

	http.ListenAndServe(":5000", nil)
}
