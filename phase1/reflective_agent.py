from typing import TypedDict, Optional
from langchain.prompts import (ChatPromptTemplate,  
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
from langgraph.graph import StateGraph, START, END
import re
import os               


class GraphState(TypedDict):
    domain_path: str
    problem_path: str
    plan_dir: str
    lore_document_path: str

    max_retries_planner: int
    max_retries_incoherence: int
    max_retries_validator: int
    planner_attempts: int
    incoherence_attempts: int
    validator_attempts: int

    planner_error_fixed: bool
    incoherence_error_fixed: bool
    validator_error_fixed: bool
    error_message: Optional[str]


class ReflectiveAgent:
    def __init__(self, 
                 planner_system_template: str, 
                 planner_human_template: str, 
                 check_incoherence_system_template: str, 
                 check_incoherence_human_template: str,
                 fix_incoherence_system_template: str, 
                 fix_incoherence_human_template: str, 
                 validator_system_template: str, 
                 validator_human_template: str,
                 model: str = "gpt-4.1-nano",):
        
        self.planner_system_template = planner_system_template
        self.planner_human_template = planner_human_template
        self.check_incoherence_system_template = check_incoherence_system_template
        self.check_incoherence_human_template = check_incoherence_human_template
        self.fix_incoherence_system_template = fix_incoherence_system_template
        self.fix_incoherence_human_template = fix_incoherence_human_template
        self.validator_system_template = validator_system_template
        self.validator_human_template = validator_human_template
        self.llm = get_llm(model)
        self.workflow = self._build_workflow()


    def _build_workflow(self):

        # 1. GENERATE THE PLAN
        def check_plan_generation(state: GraphState) -> GraphState:
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            plan_dir = state['plan_dir']
            planner_attempts = state['planner_attempts']
            
            generated, error_message = generate_plan(domain_path, problem_path, plan_dir)
            if generated:
                print("[✓] Files are correct and plan has been generated.")
                return {"planner_error_fixed": True, "error_message": None}
            else:
                print(f"\n[Fixing planner errors - Attempt {planner_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"planner_error_fixed": False, "error_message": error_message, "planner_attempts": planner_attempts + 1}


        def fix_planner_errors_node(state: GraphState) -> GraphState:
            lore_document_path = state['lore_document_path']
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            error_message = state['error_message']

            lore_document = read_file(lore_document_path)
            domain_text = read_file(domain_path)
            problem_text = read_file(problem_path)

            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.planner_system_template),
                HumanMessagePromptTemplate.from_template(self.planner_human_template)
            ])
            chain = prompt_template | self.llm
            response = chain.invoke({"error": error_message, 
                                    "lore": lore_document, 
                                    "domain": domain_text, 
                                    "problem": problem_text})
            content = response.content

            domain_match = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
            problem_match = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)

            if domain_match and problem_match:
                fixed_domain_pddl = domain_match.group(1).strip()
                fixed_problem_pddl = problem_match.group(1).strip()
                write_file(domain_path, fixed_domain_pddl)
                write_file(problem_path, fixed_problem_pddl)
                print("[✓] Files has been fixed by the agent.\n")
            else:
                print("[✗] Impossibile parsing files from the agent's output.")

            return {}
        

        # 2. PLAN'S COHERENCE
        def check_lore_incoherence(state: GraphState) -> GraphState:
            lore_document_path = state['lore_document_path']
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            plan_path = f"{state['plan_dir']}/sas_plan"
            incoherence_attempts = state['incoherence_attempts']

            lore_document = read_file(lore_document_path)
            domain_text = read_file(domain_path)
            problem_text = read_file(problem_path)
            plan_text = read_file(plan_path)

            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.check_incoherence_system_template),
                HumanMessagePromptTemplate.from_template(self.check_incoherence_human_template)
            ])
            chain = prompt_template | self.llm
            response = chain.invoke({
                'lore': lore_document,
                'domain': domain_text,
                'problem': problem_text,
                'plan': plan_text,
            })
            content = response.content

            if content.strip().upper() == "COHERENT":
                print("[✓] Files are coherente with lore document.")
                return {'incoherence_error_fixed': True, "error_message": None}
            else:
                print(f"\n[Fixing incoherence errors - Attempt {incoherence_attempts + 1}]\nIncoherence report:\n{content}\n")
                return {"incoherence_error_fixed": False, "error_message": content, "incoherence_attempts": incoherence_attempts + 1}


        def fix_lore_incoherence_node(state: GraphState) -> GraphState:
            lore_document_path = state['lore_document_path']
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            plan_path = f"{state['plan_dir']}/sas_plan"
            error_message = state['error_message']

            lore_document = read_file(lore_document_path)
            domain_text = read_file(domain_path)
            problem_text = read_file(problem_path)
            plan_text = read_file(plan_path)

            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.fix_incoherence_system_template),
                HumanMessagePromptTemplate.from_template(self.fix_incoherence_human_template)
            ])
            chain = prompt_template | self.llm
            response = chain.invoke({
                'error': error_message,
                'lore': lore_document,
                'domain': domain_text,
                'problem': problem_text,
                'plan': plan_text,
            })
            content = response.content

            domain_match = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
            problem_match = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)
            lore_match = re.search(r"<lore>(.*?)</lore>", content, re.DOTALL)

            if domain_match and problem_match:
                fixed_domain_pddl = domain_match.group(1).strip()
                fixed_problem_pddl = problem_match.group(1).strip()
                write_file(domain_path, fixed_domain_pddl)
                write_file(problem_path, fixed_problem_pddl)
                print("[✓] domain.pddl and problem.pddl have been fixed by the agent to make them coherent with the lore.\n")
                return {"planner_attempts": 0}
            elif lore_match:
                fixed_lore_document = lore_match.group(1).strip()
                write_file(lore_document_path, fixed_lore_document)
                print("[✓] Lore documetn has been updated.\n")
                return {"planner_attempts": 0}
            else:
                print("[✗] Impossibile parsing files from the agent's output.")
                return {"incoherence_error_fixed": False}


        # 3. VALIDATE THE PLAN
        def check_plan_validation(state: GraphState) -> GraphState:
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            plan_path = f"{state['plan_dir']}/sas_plan"
            validator_attempts = state['validator_attempts']
            
            valid, error_message = validate_plan(domain_path, problem_path, plan_path)
            if valid:
                print("[✓] Plan validated successfully")
                return {"validator_error_fixed": True, "error_message": None}
            else:
                print(f"\n[Fixing validator errors - Attempt {validator_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"validator_error_fixed": False, "error_message": error_message, "validator_attempts": validator_attempts + 1}
            
        
        def fix_validator_errors_node(state: GraphState) -> GraphState:
            lore_document_path = state['lore_document_path']
            domain_path = state['domain_path']
            problem_path = state['problem_path']
            plan_path = f"{state['plan_dir']}/sas_plan"
            error_message = state['error_message']

            lore_document = read_file(lore_document_path)
            domain_text = read_file(domain_path)
            problem_text = read_file(problem_path)
            plan_text = read_file(plan_path)

            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.validator_system_template),
                HumanMessagePromptTemplate.from_template(self.validator_human_template)
            ])
            chain = prompt_template | self.llm
            response = chain.invoke({
                "error": error_message,
                "lore": lore_document,
                "domain": domain_text,
                "problem": problem_text,
                "plan": plan_text
            })
            content = response.content

            domain_match = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
            problem_match = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)

            if domain_match and problem_match:
                fixed_domain_pddl = domain_match.group(1).strip()
                fixed_problem_pddl = problem_match.group(1).strip()

                write_file(domain_path, fixed_domain_pddl)
                write_file(problem_path, fixed_problem_pddl)

                print("[✓] Files has been fixed by the agent.\n")
            else:
                print("[✗] Impossibile parsing files from the agent's output.")

            return {"planner_attempts": 0, "incoherence_attempts": 0}


        def next_step_conditional_routing(state: GraphState, prefix: str) -> str:
            error_fixed_key = f"{prefix}_error_fixed"
            attempts_key = f"{prefix}_attempts"
            max_retries_key = f"max_retries_{prefix}"

            if state[error_fixed_key]:
                return 'SUCCESS'
            if not state[error_fixed_key] and state[attempts_key] < state[max_retries_key]:
                return "fix_errors"
            return "max_retries_reached"
        

        workflow = StateGraph(GraphState)
        workflow.add_node("check_plan_generation", check_plan_generation)
        workflow.add_node("fix_planner_errors_node", fix_planner_errors_node)
        workflow.add_node("check_lore_incoherence", check_lore_incoherence) 
        workflow.add_node("fix_lore_incoherence_node", fix_lore_incoherence_node)
        workflow.add_node("check_plan_validation", check_plan_validation)
        workflow.add_node("fix_validator_errors_node", fix_validator_errors_node)

        workflow.add_edge(START, "check_plan_generation")
        workflow.add_conditional_edges(
            "check_plan_generation",
            lambda state: next_step_conditional_routing(state, "planner"),
            {
                "fix_errors": "fix_planner_errors_node",
                "SUCCESS": "check_lore_incoherence",
                "max_retries_reached": END
            }
        )
        workflow.add_edge("fix_planner_errors_node", "check_plan_generation")
        workflow.add_conditional_edges(
            "check_lore_incoherence",
            lambda state: next_step_conditional_routing(state, "incoherence"), 
            {
                "fix_errors": "fix_lore_incoherence_node",
                "SUCCESS": "check_plan_validation",
                "max_retries_reached": END
            }
        )
        workflow.add_edge("fix_lore_incoherence_node", "check_plan_generation")

        workflow.add_conditional_edges(
            "check_plan_validation",
            lambda state: next_step_conditional_routing(state, "validator"),
            {
                "fix_errors": "fix_validator_errors_node",
                "SUCCESS": END,
                "max_retries_reached": END
            }
        )
        workflow.add_edge("fix_validator_errors_node", "check_plan_generation")

        compiled_workflow = workflow.compile()
        png_bytes = compiled_workflow.get_graph().draw_mermaid_png()
        save_workflow_img("phase1/images", "workflow_reflective_agent", png_bytes)

        return compiled_workflow
        

    def check_and_fix_errors(self,
                       domain_path: str = "pddl/domain.pddl",
                       problem_path: str = "pddl/problem.pddl",
                       plan_dir: str = "pddl",
                       lore_document_path: str = "pddl/lore.txt",
                       max_retries_planner: int = 3,
                       max_retries_incoherence: int = 3,
                       max_retries_validator: int = 3) -> bool:
        
        print(f"--- STARTING ERROR CORRECTION WORKFLOW ---")

        initial_state: GraphState = {
            "domain_path": domain_path,
            "problem_path": problem_path,
            "plan_dir": plan_dir,
            "lore_document_path": lore_document_path,

            "max_retries_planner": max_retries_planner,
            "max_retries_incoherence": max_retries_incoherence,
            "max_retries_validator": max_retries_validator,
            "planner_attempts": 0,
            "incoherence_attempts": 0,
            "validator_attempts": 0,

            "planner_error_fixed": False,
            "incoherence_error_fixed": False,
            "validator_error_fixed": False,
            "error_message": None
        }

        state = self.workflow.invoke(initial_state)

        if state['planner_error_fixed'] and state['incoherence_error_fixed'] and state['validator_error_fixed']:
            print("\n--- WORKFLOW COMPLETED SUCCESSFULLY: Plan generated and validated! ---")
            return True
        else:
            print("\n--- WORKFLOW FAILED: Unable to generate and validate plan within max retries. ---")
            if state['error_message']:
                print(f"Last error: {state['error_message']}")
            return False