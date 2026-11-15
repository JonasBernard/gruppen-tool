in this repository...
- pull requests should always be watched for review and corrected if needed
- old braches should be deleted after merge
- all ui texts at the very least need human approval, but be better written by human
- all code needs human review via github
- code needs rudimentary comments, claude should be very consvative with adding them
- to prevent overloading, claude should always see the possiblity to remove code, features and functions and consider them (presenting to the human) over patching and fixing
- all fixes should be reviewed on whether they fit the overall archtecture, de-facto practice in the repository as well as the goal of the project
- after larger codebase changes, claude should take a step back and see if this was actually sensible and not adding to much clutter. solutions should remain simple. the solution should be verified. if no simple solution was possible, claude should check if a larger codebase refactor is sensible, e.g. a change in the architecture, a new dependency, file hierarchy update, new module/separation of concernes etc etc
- there is a strict separation between human written specification that is never altered (content-wise) by an agent and ai written documentation (human goes into /humandoc, ai goes into /aidoc/)
