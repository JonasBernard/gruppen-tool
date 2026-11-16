import time
import traceback
from flask import Flask, request
import solver
from flask_cors import CORS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024

MAX_NUM_REQUESTED_ASSIGNMENTS = 15
MAX_PARTICIPANTS = 150
MAX_WORKSHOPS = 150

def input_exception(message):
    return {
        "status": "v2:input-error",
        "message": message
    }, 400

def is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)

def validate_types(participants, workshops, settings):
    if not isinstance(participants, list) or not isinstance(workshops, list):
        return "participants and workshops must be lists."
    for participant in participants:
        if not isinstance(participant, dict) or not isinstance(participant.get('name'), str):
            return "Each participant must have a name."
        wishes = participant.get('wishes')
        if not isinstance(wishes, list) or not all(isinstance(w, str) for w in wishes):
            return "Each participant must have a list of wishes."
    for workshop in workshops:
        if not isinstance(workshop, dict) or not isinstance(workshop.get('name'), str):
            return "Each workshop must have a name."
        if not is_int(workshop.get('capacity')) or workshop['capacity'] < 0:
            return "Each workshop must have a non-negative integer capacity."
    for key in ['allowAssignmentToNonWishedWorkshop', 'useWeighted', 'allowSameWorkshopTwice', 'allowSecondWorkshopBeforeFirstFilled']:
        if not isinstance(settings.get(key, False), bool):
            return f"{key} must be a boolean."
    for key in ['numberOfWishesPerParticipant', 'numberOfRequestedAssignments', 'numberOfWorkshopsPerParticipant']:
        if not is_int(settings.get(key, 1)):
            return f"{key} must be an integer."
    slack = settings.get('objectiveSlack', 0.0)
    if not isinstance(slack, (int, float)) or isinstance(slack, bool):
        return "objectiveSlack must be a number."
    if not isinstance(settings.get('randomSeed', ""), (str, type(None))):
        return "randomSeed must be a string."
    return None

@app.route('/', methods=['POST'])
def index():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return input_exception("The request body must be a JSON object.")
    
    participants = data.get('participants', [])
    workshops = data.get('workshops', [])
    settings = data.get('settings', {})
    if not isinstance(settings, dict):
        return input_exception("settings must be an object.")
    
    type_error = validate_types(participants, workshops, settings)
    if type_error:
        return input_exception(type_error)
    
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
        
        if len(workshops) > MAX_WORKSHOPS:
            return input_exception(f"Number of workshops must be at most {MAX_WORKSHOPS}.")
    
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
    
        start_time = time.time()
        solutions = solver.solve_group_assignment(participants, workshops, options)
        elapsed_time = time.time() - start_time
        
        print(f"Solving took {elapsed_time:.2f} seconds.")
    except Exception as e:
        if str(e) == "Time or memory limit reached.":
            return {
                "status": "v2:mem-time-limit",
                "message": "The time or memory limit was reached before a solution was found."
            }, 500
        if str(e) == "Problem is infeasible.":
            return {
                "status": "v2:infeasible",
                "message": "The problem is infeasible. No assignment is possible."
            }, 500
        traceback.print_exc()
        return {
            "status": "v2:scip-exception",
            "message": "Internal error while computing the assignment."
        }, 500
    
    if len(solutions) == 1:
        if num_requested_assignments > 1:
            return {
                "status": "v2:ok-single-unique",
                "computation_time": elapsed_time,
                "solutions": solutions
            }
        return {
            "status": "v2:ok-single-requested",
            "computation_time": elapsed_time,
            "solutions": solutions
        }
    if len(solutions) == 0:
        return {
            "status": "v2:no-solution",
            "computation_time": elapsed_time,
            "solutions": []
        }
    return {
        "status": "v2:ok",
        "computation_time": elapsed_time,
        "solutions": solutions
    }

if __name__ == '__main__':
    CORS(app)
    app.run(host='0.0.0.0', port=5010)
