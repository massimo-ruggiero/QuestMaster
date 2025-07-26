import yaml
from utils import generative_system_template, fill_lore_system_template
from agents.pddl_agent import PDDLAgent
from agents.reflective_agent import ReflectiveAgent
from agents.lore_agent import LoreAgent
from agents.game_agent import GameAgent
from agents.image_agent import ImageAgent

with open('templates.yaml', 'r') as f:
    tpl = yaml.safe_load(f)

# Lore
LORE_SYSTEM_TPL = fill_lore_system_template(tpl['lore']['system'])

# PDDL
PDDL_SYSTEM_TPL = generative_system_template(tpl['pddl']['system'])
PDDL_HUMAN_TPL  = tpl['pddl']['human']

# Reflective
REF = tpl['reflective']

# Game
GAME_SYSTEM_TPL = tpl['game']['system']
GAME_HUMAN_TPL  = tpl['game']['human']

# Image
IMAGE_SYSTEM_TPL = tpl['image']['system']
IMAGE_STYLE_TPL  = tpl['image']['style']



pddl_agent = PDDLAgent(
    system_template=PDDL_SYSTEM_TPL,
    human_template=PDDL_HUMAN_TPL,
    model="gemini-2.5-pro"
)

reflective_agent = ReflectiveAgent(
    planner_system_template=REF['planner']['system'],
    planner_human_template=REF['planner']['human'],
    check_incoherence_system_template=REF['incoherence']['check']['system'],
    check_incoherence_human_template=REF['incoherence']['check']['human'],
    fix_incoherence_system_template=REF['incoherence']['fix']['system'],
    fix_incoherence_human_template=REF['incoherence']['fix']['human'],
    validator_system_template=REF['validator']['system'],
    validator_human_template=REF['validator']['human'],
    model="gemini-2.5-pro"
)

lore_agent = LoreAgent(
    system_template=LORE_SYSTEM_TPL,
    model="gpt-4o-mini",
    pddl_path="pddl"
)

image_agent = ImageAgent(style_description= IMAGE_STYLE_TPL,
                         system_template= IMAGE_SYSTEM_TPL,
                         

)

game_agent = GameAgent(system_template=GAME_SYSTEM_TPL,
                      human_template=GAME_HUMAN_TPL,
                      image_agent= image_agent
                      )