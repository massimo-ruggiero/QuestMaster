from typing import TypedDict, Optional
from langchain.prompts import (ChatPromptTemplate,  
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
from langgraph.graph import StateGraph, START, END
import re


class GraphState(TypedDict):
    domain_path: str
    problem_path: str
    plan_dir: str
    lore_document_path: str

    max_retries_planner: int
    max_retries_validator: int
    planner_attempts: int
    validator_attempts: int

    planner_error_fixed: bool
    validator_error_fixed: bool
    error_message: Optional[str]


class ReflectiveAgent:
    def __init__(self, 
                 planner_system_template: str, 
                 planner_human_template: str, 
                 validator_system_template: str, 
                 validator_human_template: str,
                 model: str = "gpt-4.1-nano",):
        
        self.planner_system_template = planner_system_template
        self.planner_human_template = planner_human_template
        self.validator_system_template = validator_system_template
        self.validator_human_template = validator_human_template
        self.llm = get_llm(model)
        self.workflow = self._build_workflow()


    def _build_workflow(self):
         
        def check_plan_generation(state: GraphState) -> GraphState:
            domain_path = state["domain_path"]
            problem_path = state["problem_path"]
            plan_dir = state["plan_dir"]
            max_retries_planner = state["max_retries_planner"]
            planner_attempts = state["planner_attempts"]

            if planner_attempts >= max_retries_planner:
                print("[✗] Max retries for plan generation reached. Files still incorrect.")
                return {"planner_error_fixed": False, "error_message": "Max retries for plan generation reached."}
            
            generated, error_message = generate_plan(domain_path, problem_path, plan_dir)

            if generated:
                print("[✓] Files are correct and plan has been generated.")
                return {"planner_error_fixed": True, "error_message": None}
            else:
                print(f"\n[Fixing planner errors - Attempt {planner_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"planner_error_fixed": False, "error_message": error_message, "planner_attempts": planner_attempts + 1}


        def fix_planner_errors_node(state: GraphState) -> GraphState:
            domain_path = state["domain_path"]
            problem_path = state["problem_path"]
            lore_document_path = state["lore_document_path"]
            error_message = state["error_message"]

            lore_document = load_lore(lore_document_path)
            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.planner_system_template),
                HumanMessagePromptTemplate.from_template(self.planner_human_template)
            ])
            with open(domain_path, 'r', encoding="utf-8") as f:
                domain_text = f.read()
            with open(problem_path, 'r', encoding="utf-8") as f:
                problem_text = f.read()

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

                with open(domain_path, 'w', encoding="utf-8") as f:
                    f.write(fixed_domain_pddl)
                with open(problem_path, 'w', encoding="utf-8") as f:
                    f.write(fixed_problem_pddl)
                print("[✓] Files has been fixed by the agent.")
            else:
                print("[✗] Impossibile parsing files from the agent's output.")

            return state


        def check_plan_validation(state: GraphState) -> GraphState:
            domain_path = state["domain_path"]
            problem_path = state["problem_path"]
            plan_path = f"{state["plan_dir"]}/sas_plan"
            max_retries_validator = state["max_retries_validator"]
            validator_attempts = state["validator_attempts"]

            if not os.path.exists(plan_path):
                print(f"Plan file not found at path: {plan_path}. Re-attempting plan generation.")
                return {"validator_error_fixed": False, "error_message": "Plan file not found after generation. Re-attempting plan generation.", "planner_attempts": 0}
            
            if validator_attempts >= max_retries_validator:
                print("[✗] Max retries for plan validation reached. Files still incorrect.")
                return {"validator_error_fixed": False, "error_message": "Max retries for plan validation reached."}
            
            valid, error_message = validate_plan(domain_path, problem_path, plan_path)

            if valid:
                print("[✓] Plan validated successfully")
                return {"validator_error_fixed": True, "error_message": None}
            else:
                print(f"\n[Fixing validator errors - Attempt {validator_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"validator_error_fixed": False, "error_message": error_message, "validator_attempts": validator_attempts + 1}
            
        
        def fix_validator_errors_node(state: GraphState) -> GraphState:
            domain_path = state["domain_path"]
            problem_path = state["problem_path"]
            plan_path = state["plan_path"]
            lore_document_path = state["lore_document_path"]
            error_message = state["error_message"]

            lore_document = load_lore(lore_document_path)
            prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.validator_system_template),
                HumanMessagePromptTemplate.from_template(self.validator_human_template)
            ])
            with open(domain_path, 'r', encoding="utf-8") as f:
                domain_text = f.read()
            with open(problem_path, 'r', encoding="utf-8") as f:
                problem_text = f.read()
            with open(plan_path, 'r', encoding="utf-8") as f:
                plan_text = f.read()

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

                with open(domain_path, 'w', encoding="utf-8") as f:
                    f.write(fixed_domain_pddl)
                with open(problem_path, 'w', encoding="utf-8") as f:
                    f.write(fixed_problem_pddl)
                print("[✓] Files has been fixed by the agent.")
            else:
                print("[✗] Impossibile parsing files from the agent's output.")

            return {"planner_attempts": 0}


        def next_step_after_planner(state: GraphState) -> str:
            if state["planner_error_fixed"]:
                return "plan_generated" 
            if not state["planner_error_fixed"] and state["planner_attempts"] < state["max_retries_planner"]:
                return "fix_errors" 
            return "max_retries_reached"


        def next_step_after_validator(state: GraphState) -> str:
            if state["validator_error_fixed"]:
                return "plan_validated"
            if not state["validator_error_fixed"] and state["validator_attempts"] < state["max_retries_validator"]:
                return "fix_errors" 
            return "max_retries_reached" 


        workflow = StateGraph(GraphState)
        workflow.add_node("check_plan_generation", check_plan_generation)
        workflow.add_node("fix_planner_errors_node", fix_planner_errors_node)
        workflow.add_node("check_plan_validation", check_plan_validation)
        workflow.add_node("fix_validator_errors_node", fix_validator_errors_node)

        workflow.add_edge(START, "check_plan_generation")
        workflow.add_conditional_edges(
            "check_plan_generation",
            next_step_after_planner,
            {
                "fix_errors": "fix_planner_errors_node",
                "plan_generated": "check_plan_validation",
                "max_retries_reached": END
            }
        )
        workflow.add_edge("fix_planner_errors_node", "check_plan_generation")
        workflow.add_conditional_edges(
            "check_plan_validation",
            next_step_after_validator,
            {
                "fix_errors": "fix_validator_errors_node",
                "plan_validated": END,
                "max_retries_reached": END
            }
        )
        workflow.add_edge("fix_validator_errors_node", "check_plan_generation")
        compiled_workflow = workflow.compile()
        #png_bytes = compiled_workflow.get_graph().draw_mermaid_png()
        #with open("workflow.png", "wb") as f:
        #    f.write(png_bytes)
        return compiled_workflow
        

    def check_and_fix_errors(self,
                       domain_path: str = "pddl/domain.pddl",
                       problem_path: str = "pddl/problem.pddl",
                       plan_dir: str = "pddl",
                       lore_document_path: str = "pddl/lore.txt",
                       max_retries_planner: int = 3,
                       max_retries_validator: int = 3) -> bool:
        
        print(f"--- STARTING ERROR CORRECTION WORKFLOW ---")

        initial_state: GraphState = {
            "domain_path": domain_path,
            "problem_path": problem_path,
            "plan_dir": plan_dir,
            "lore_document_path": lore_document_path,

            "max_retries_planner": max_retries_planner,
            "max_retries_validator": max_retries_validator,
            "planner_attempts": 0,
            "validator_attempts": 0,

            "planner_error_fixed": False,
            "validator_error_fixed": False,
            "error_message": None
        }

        state = self.workflow.invoke(initial_state)

        if state["planner_error_fixed"] and state["validator_error_fixed"]:
            print("\n--- WORKFLOW COMPLETED SUCCESSFULLY: Plan generated and validated! ---")
            return True
        else:
            print("\n--- WORKFLOW FAILED: Unable to generate and validate plan within max retries. ---")
            if state["error_message"]:
                print(f"sLast error: {state['error_message']}")
            return False