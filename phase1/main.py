from pddl_agent import PDDLAgent
from reflective_agent import ReflectiveAgent
from lore_agent import LoreAgent
from utils import *
import yaml


with open('templates.yaml', 'r') as file:
    templates = yaml.safe_load(file)

# Lore Agent Templates
LORE_SYSTEM_TMPL = templates['lore']['system']
LORE_HUMAN_TMPL = templates['lore']['human']

# PDDL Agent Templates
PDDL_SYSTEM_TMPL = generative_system_template (templates['pddl']['system'])
PDDL_HUMAN_TMPL  = templates['pddl']['human']

# Reflective Agent Templates
PLANNER_SYSTEM_TMPL  = templates['reflective']['planner']['system']
PLANNER_HUMAN_TMPL  = templates['reflective']['planner']['human']
VALIDATOR_SYSTEM_TMPL  = templates['reflective']['validator']['system']
VALIDATOR_HUMAN_TMPL  = templates['reflective']['validator']['human']


def main():
    lore_agent = LoreAgent(system_template=LORE_SYSTEM_TMPL, 
                           human_template=LORE_HUMAN_TMPL, 
                           model="gpt-4.1-nano")
    lore_agent.generate_lore()

    pddl_agent = PDDLAgent(system_template=PDDL_SYSTEM_TMPL, 
                           human_template=PDDL_HUMAN_TMPL, 
                           model="gemini-2.5-pro")
    pddl_agent.generate_pddl()

    reflective_agent = ReflectiveAgent(planner_system_template=PLANNER_SYSTEM_TMPL,
                                       planner_human_template=PLANNER_HUMAN_TMPL,
                                       validator_system_template=VALIDATOR_SYSTEM_TMPL,
                                       validator_human_template=VALIDATOR_HUMAN_TMPL,
                                       model="gpt-4.1-nano")

    #TODO: ogni volta che sistemiamo gli errori del validator (modificando i file) il piano va RIGENERATO.
    reflective_agent.correct_planner_errors(max_retries=20)
    reflective_agent.correct_validator_errors(max_retries=20)

if __name__ == "__main__":
    main()