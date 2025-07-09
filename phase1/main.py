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
CHECK_INCOHERENCE_SYSTEM_TMPL  = templates['reflective']['incoherence']['check']['system']
CHECK_INCOHERENCE_HUMAN_TMPL  = templates['reflective']['incoherence']['check']['human']
FIX_INCOHERENCE_SYSTEM_TMPL  = templates['reflective']['incoherence']['fix']['system']
FIX_INCOHERENCE_HUMAN_TMPL  = templates['reflective']['incoherence']['fix']['human']
VALIDATOR_SYSTEM_TMPL  = templates['reflective']['validator']['system']
VALIDATOR_HUMAN_TMPL  = templates['reflective']['validator']['human']


def main():
    #lore_agent = LoreAgent(system_template=LORE_SYSTEM_TMPL, 
    #                       human_template=LORE_HUMAN_TMPL, 
    #                       model="gpt-4.1-nano")
    #lore_agent.generate_lore()

    #pddl_agent = PDDLAgent(system_template=PDDL_SYSTEM_TMPL, 
    #                       human_template=PDDL_HUMAN_TMPL, 
    #                       model="gemini-2.5-pro")
    #pddl_agent.generate_pddl()

    reflective_agent = ReflectiveAgent(planner_system_template=PLANNER_SYSTEM_TMPL,
                                       planner_human_template=PLANNER_HUMAN_TMPL,
                                       check_incoherence_system_template=CHECK_INCOHERENCE_SYSTEM_TMPL,
                                       check_incoherence_human_template=CHECK_INCOHERENCE_HUMAN_TMPL,
                                       fix_incoherence_system_template=FIX_INCOHERENCE_SYSTEM_TMPL,
                                       fix_incoherence_human_template=FIX_INCOHERENCE_HUMAN_TMPL,
                                       validator_system_template=VALIDATOR_SYSTEM_TMPL,
                                       validator_human_template=VALIDATOR_HUMAN_TMPL,
                                       model="gemini-2.5-pro")
    reflective_agent.check_and_fix_errors(max_retries_planner=10, max_retries_validator=5)

if __name__ == "__main__":
    main()