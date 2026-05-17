from flask import Flask, request
import solver
from flask_cors import CORS
from solver import MAX_COMPUTED_ASSIGNMENTS

app = Flask(__name__)

MAX_NUM_REQUESTED_ASSIGNMENTS = 15
MAX_PARTICIPANTS = 150

def input_exception(message):
    return {
        "status": "v2:input-error",
        "message": message
    }, 400

@app.route('/', methods=['POST'])
def index():
    data = request.get_json()
    
    participants = data.get('participants', [])
    workshops = data.get('workshops', [])
    
    settings = data.get('settings', {})
    allow_non_wished = settings.get('allowAssignmentToNonWishedWorkshop', False)
    num_wishes_per_participant = settings.get('numberOfWishesPerParticipant', 3)
    use_weighted = settings.get('useWeighted', True)
    num_requested_assignments = settings.get('numberOfRequestedAssignments', 3)
    num_workshops_per_participant = settings.get('numberOfWorkshopsPerParticipant', 1)
    allow_same_workshop_twice = settings.get('allowSameWorkshopTwice', False)
    allow_second_workshop_before_first_filled = settings.get('allowSecondWorkshopBeforeFirstFilled', False)
    random_seed = settings.get('randomSeed', None)
    objective_slack = settings.get('objectiveSlack', 0.0)
    
    try:
        if num_wishes_per_participant <= 0:
            return input_exception("numberOfWishesPerParticipant must be at least 1.")
        
        if num_wishes_per_participant > 6:
            return input_exception("numberOfWishesPerParticipant must be at most 6.")
        
        if num_requested_assignments <= 0:
            return input_exception("numberOfRequestedAssignments must be at least 1.")
        
        if num_requested_assignments > MAX_NUM_REQUESTED_ASSIGNMENTS:
            return input_exception(f"numberOfRequestedAssignments must be at most {MAX_NUM_REQUESTED_ASSIGNMENTS}.")

        if num_workshops_per_participant <= 0:
            return input_exception("numberOfWorkshopsPerParticipant must be at least 1.")
        
        if num_workshops_per_participant > 5:
            return input_exception("numberOfWorkshopsPerParticipant must be at most 5.")
        
        if objective_slack < 0.0 or objective_slack > 1.0:
            return input_exception("objectiveSlack must be between 0.0 and 1.0.")
        
        if len(participants) > MAX_PARTICIPANTS:
            return input_exception(f"Number of participants must be at most {MAX_PARTICIPANTS}.")
    
        options = {
            'allow_non_wished': allow_non_wished,
            'num_wishes_per_participant': num_wishes_per_participant,
            'use_weighted': use_weighted,
            'num_requested_assignments': num_requested_assignments,
            'num_workshops_per_participant': num_workshops_per_participant,
            'allow_same_workshop_twice': allow_same_workshop_twice,
            'allow_second_workshop_before_first_filled': allow_second_workshop_before_first_filled,
            'random_seed': random_seed,
            'objective_slack': objective_slack
        }
    
        solutions = solver.solve_group_assignment(participants, workshops, options)
    except Exception as e:
        if str(e) == "Problem is infeasible.":
            return {
                "status": "v2:infeasible",
                "message": "The problem is infeasible. No assignment is possible."
            }, 500
        return {
            "status": "v2:scip-exception",
            "message": str(e)
        }, 500
    if len(solutions) == 1:
        return {
            "status": "v2:ok-single",
            "solutions": solutions
        }
    if len(solutions) == 0:
        return {
            "status": "v2:no-solution",
            "solutions": []
        }
    return {
        "status": "v2:ok",
        "solutions": solutions
    }

if __name__ == '__main__':
    CORS(app)
    app.run(host='0.0.0.0', port=5010)
