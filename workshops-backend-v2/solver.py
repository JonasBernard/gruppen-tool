from pyscipopt import Model, quicksum
import random

MAX_COMPUTED_ASSIGNMENTS = 50

DEBUG = True

def solve_group_assignment(participants, workshops, 
                           allow_non_wished, num_wishes_per_participant, use_weighted, 
                           num_requested_assignments, num_workshops_per_participant, 
                           allow_same_workshop_twice, random_seed, objective_slack):
    # 1. Initialize the Model
    model = Model("GroupAssignment")
    model.setMaximize()


    if random_seed == "":
        random_seed = None
    
    random.seed(random_seed)
    
    # this introduces some randomness but not enough to guarantee even distribution
    # could be skipped.
    random.shuffle(participants)
    random.shuffle(workshops)
    
    lpseed = random.randint(1, 1000000)
    permutationseed = random.randint(1, 1000000)

    n = len(participants)
    m = len(workshops)

    # 2. Create Variables
    # TODO only create the variables that are needed in the end (allow_non_wished)
    x = {}
    for k in range(n):
        ub = num_workshops_per_participant if allow_same_workshop_twice else 1
        for j in range(m):
            x[k, j] = model.addVar(vtype="I", lb=0, ub=ub, name=f"assign_{k}_{j}")
        x[k, m] = model.addVar(vtype="I", lb=0, ub=ub, name=f"assign_{k}_none")

    obj_terms = []
    
    for k, participant in enumerate(participants):
        for j, workshop in enumerate(workshops):
            if not "name" in workshop:
                # rasing is saver and easier to debug
                raise ValueError(f"Workshop {j} is missing a name.")
            
            if workshop['name'] in participant['wishes']:
                weight = 1
                if use_weighted:
                    num_wish = participant['wishes'].index(workshop['name'])
                    weight = num_wishes_per_participant - num_wish + 1
                obj_terms.append(weight * x[k, j])
            else:
                if allow_non_wished:
                    obj_terms.append(1 * x[k, j])
                else:
                    model.addCons(x[k, j] == 0, name=f"no_wish_{k}_{j}")

    model.setObjective(quicksum(obj_terms), "maximize")
    # TODO remove the following line if needed
    model.setObjIntegral() # Informs SCIP that the objective value is always integral in every feasible solution.

    # Each participant must be assigned to so and so many workshops, can be assigned to "none" if not enough workshops available
    for k in range(n):
        model.addCons(quicksum(x[k, j] for j in range(m+1)) == num_workshops_per_participant, name=f"num_assignments_{k}")
        
    if not allow_same_workshop_twice:
        for k in range(n):
            for j in range(m):
                model.addCons(x[k, j] <= 1, name=f"no_same_workshop_{k}_{j}")

    # Capacity constraints per workshop
    for j in range(m):
        if workshops[j]['capacity'] == "":
            capacity = 0
        else:
            capacity = int(workshops[j]['capacity'])
        model.addCons(quicksum(x[i, j] for i in range(n)) <= capacity, name=f"cap_{j}")

    print(f"Solving for {n} participants and {m} workshops...")
    
    model.setRealParam("limits/time", 60)
    model.setRealParam("limits/memory", 1024)
    
    # Step 3: Find objective
    model.optimize()
    objective_value = model.getObjVal()
    
    if DEBUG:
        model.writeProblem(filename="problem.lp", trans=False, genericnames=False)
        model.writeProblem(filename="problem_transformed.lp", trans=True, genericnames=False)
    
    print(f"Optimal objective value: {objective_value}")
    
    model.freeTransform() # allow reoptimization
    value_threshold = objective_value * (1.0 - objective_slack)
    print(f"Adding objective slack constraint: objective >= {value_threshold} (slack: {objective_slack*100}%)")
    model.addCons(quicksum(obj_terms) >= value_threshold, name="objective_slack_constraint")
    model.setObjective(0)

    # Step 4: Find multiple solutions
    model.setIntParam("randomization/lpseed", lpseed)
    model.setIntParam("randomization/permutationseed", permutationseed)
    model.setBoolParam("randomization/permuteconss", True)
    
    # This flags seem to have no effect
    # model.setBoolParam("constraints/countsols/collect", True)
    # model.setBoolParam("constraints/countsols/discardsols", False)
    # model.setIntParam("limits/solutions", 100000)

    print("Finding multiple solutions...")

    # Get the list of all solutions found
    # This does not work as expected, it does not collect all solutions, also it is not determinitic
    # Count() only will produce no solutions
    # Optimize() only will produce one solution
    # Both together will produce some solutions but not all, and it is not deterministic which ones. Mostly one solution.
    # model.optimize()
    # model.count()
    # sols = model.getSols()
    
    ## SOLUTION: Find all solutions by hand.
    M = num_workshops_per_participant + 2 # for < vs <= reasons
    sols = []
    l = 0
    while l < MAX_COMPUTED_ASSIGNMENTS:
        l += 1
        
        model.optimize()
        
        if model.getStatus() not in ["optimal", "feasible"]:
            print("No more solutions found.")
            break
        
        if not model.checkSol(model.getBestSol()):
            print(f"Warning: Solution {selection_order[i]} is not feasible. Skipping.")
            continue

        vals = [[round(model.getVal(x[i, j])) for j in range(m+1)] for i in range(n)]
        
        print("All auxiliary variable values:")
        for v in model.getVars():
            print(f"{v.name}: {model.getVal(v)}")
        
        print("Found solution:", vals)
        sols.append(vals)

        model.freeTransform()
        
        # -------------------------------------------------
        # No-good Constraint
        # -------------------------------------------------

        diff_vars = []

        for i in range(n):
            for j in range(m+1):
                val = vals[i][j]
                
                # Binärvariable:
                # b_i = 1  <=> x_i != val
                not_eq_bit = model.addVar(vtype="BINARY", name=f"neqbit_{l}_{i}_{j}")
                strict_gt = model.addVar(vtype="BINARY", name=f"diffsigngt_{l}_{i}_{j}")
                strict_lt = model.addVar(vtype="BINARY", name=f"diffsignlt_{l}_{i}_{j}")

                diff_vars.append(not_eq_bit)
                
                # Step 1: Trivial: If not_eq_bit == 0, then x must be equal to val
                model.addCons(x[i, j] - val <= M * not_eq_bit, name=f"exclude_sol_{l}_{i}_{j}_1")
                model.addCons(val - x[i, j] <= M * not_eq_bit, name=f"exclude_sol_{l}_{i}_{j}_2")
                
                # Step 2: If not_eq_bit == 1, then x must be different from val
                # Step 2.2 If x < val <==> strict_lt = 1
                model.addCons(x[i, j] <= val - 1 + M * (1 - strict_lt), name=f"exclude_sol_{l}_{i}_{j}_3")
                model.addCons(x[i, j] >= val - M * strict_lt, name=f"exclude_sol_{l}_{i}_{j}_4")
                
                # Step 2.2 If val < x <==> strict_gt = 1
                model.addCons(val <= x[i, j] - 1 + M * (1 - strict_gt), name=f"exclude_sol_{l}_{i}_{j}_5")
                model.addCons(val >= x[i, j] - M * strict_gt, name=f"exclude_sol_{l}_{i}_{j}_6")
                
                _add_disjunction_of_indicators(model, strict_gt, strict_lt, not_eq_bit)
 
        model.addCons(quicksum(diff_vars) >= 1)
    
    num_found = len(sols)
    
    print(f"Number of solutions found by manual enumeration: {num_found}")
    
    if num_found > 0:
        possible_solutions = list(range(1, num_found))
        random.shuffle(possible_solutions)
        selection_order = [0] + possible_solutions
        
        print(f"Selection order of solutions: {selection_order}")
        
        assignments = []
        
        max_possible_objective = 0
        if use_weighted:
            max_possible_objective = (num_wishes_per_participant+1) * n * num_workshops_per_participant
        else:
            max_possible_objective = n * num_workshops_per_participant
        
        i=0
        while len(assignments) < min(num_requested_assignments, num_found):
            if i >= len(selection_order):
                print("Not enough solutions found to meet the requested number of assignments. Stopping.")
                break
            
            selected_sol = sols[selection_order[i]]
            objective_value = _retrieve_objective_value(selected_sol, participants, workshops, num_wishes_per_participant, use_weighted)
            print(f"Using solution no. {selection_order[i]} with objective value {objective_value}...")
            
            assignment = []
            
            for k in range(n):
                if not "name" in participants[k]:
                    # TODO why are we only realizing this here? This is quite late
                    raise ValueError(f"Participant {k} is missing a name.")
                
                participant_assignment = [participants[k]['name']]
                
                for j in range(m):
                    val = selected_sol[k][j]
                    
                    while val > 0.5:
                        participant_assignment.append(workshops[j]['name'])
                        val -= 1
                val = selected_sol[k][m]
                while val > 0.5:
                    participant_assignment.append("none")
                    val -= 1
                    
                assignment.append(participant_assignment)
            
            assignments.append({
                "objective": objective_value,
                "num_assigned_participants": len(assignment),
                "score": objective_value / max_possible_objective if max_possible_objective > 0 else 0,
                "assignment": assignment
            })
            
            i += 1
        
        # free up space
        model.freeProb()
        
        assignments.sort(key=lambda x: x['objective'], reverse=True)
        
        return assignments
    else:
        print("No solutions found. Return empty list.")
        return []


def _retrieve_objective_value(solution, participants, workshops, num_wishes_per_participant, use_weighted):
    objective_value = 0
    for k, participant in enumerate(participants):
        for j, workshop in enumerate(workshops):
            if workshop['name'] in participant['wishes']:
                weight = 1
                if use_weighted:
                    num_wish = participant['wishes'].index(workshop['name'])
                    weight = num_wishes_per_participant - num_wish + 1
                objective_value += weight * solution[k][j]
            else:
                objective_value += 1 * solution[k][j]
    return objective_value

def _add_disjunction_of_indicators(model, binary_var_a, binary_var_b, binary_disj_var):
    model.addCons(binary_disj_var >= binary_var_a)
    model.addCons(binary_disj_var >= binary_var_b)
    model.addCons(binary_disj_var <= binary_var_a + binary_var_b)
