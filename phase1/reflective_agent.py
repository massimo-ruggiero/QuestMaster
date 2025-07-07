from typing import Optional
from langchain.prompts import (ChatPromptTemplate, 
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
import re


class ReflectiveAgent:
    def __init__(self, 
                 planner_system_template: Optional[str] = None, 
                 planner_human_template: Optional[str] = None, 
                 validator_system_template: Optional[str] = None, 
                 validator_human_template: Optional[str] = None,
                 model: str = "gpt-4.1-nano",):
        
        self.planner_system_template = planner_system_template
        self.planner_human_template = planner_human_template
        self.validator_system_template = validator_system_template
        self.validator_human_template = validator_human_template
        self.llm = get_llm(model)

    
    def correct_planner_errors(self, 
                              domain_path: str = "pddl/domain.pddl", 
                              problem_path: str = "pddl/problem.pddl", 
                              plan_dir: str = "pddl",
                              lore_document_path: str = "pddl/lore.txt",
                              max_retries: int = 3) -> bool:
        
        if not (self.planner_system_template or self.planner_human_template):
            raise ValueError("You must provide system and human planner templates.")

        lore_document = load_lore(lore_document_path)
        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(self.planner_system_template),
            HumanMessagePromptTemplate.from_template(self.planner_human_template)
        ])
        with open(domain_path, 'r', encoding="utf-8") as f:
            domain_text = f.read()
        with open(problem_path, 'r', encoding="utf-8") as f:
            problem_text = f.read()

        attempts = 0
        while attempts < max_retries:
            correct, error_message = generate_plan(domain_path, problem_path, plan_dir)
            if correct is True:
                print("[✓] Files are sintattically correct.")
                return True
            print(f"\n[Attempt {attempts + 1}] Planner error:\n{error_message}\n")

            chain = prompt_template | self.llm
            response = chain.invoke({"error": error_message, 
                                     "lore": lore_document, 
                                     "domain": domain_text, 
                                     "problem": problem_text})
            content = response.content

            domain = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
            problem = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)
            corrected_domain_pddl = domain.group(1).strip()
            corrected_problem_pddl = problem.group(1).strip()

            domain_text = corrected_problem_pddl
            problem_text = corrected_problem_pddl
            attempts += 1

        with open(domain_path, 'w', encoding="utf-8") as f:
                f.write(domain_text)
        with open(problem_path, 'w', encoding="utf-8") as f:
                f.write(problem_text)

        print("[✗] Maximum number of correction attempts reached. Files still incorrect.")
        return False


    def correct_validator_errors(self,
                                domain_path: str = "pddl/domain.pddl", 
                                problem_path: str = "pddl/problem.pddl", 
                                plan_path: str = "pddl/sas_plan",
                                lore_document_path: str = "pddl/lore.txt",
                                max_retries: int = 3) -> bool:
        
        if not os.path.exists(plan_path):
            raise FileNotFoundError(f"Plan file not found at path: {plan_path}")
        if not (self.validator_system_template or self.validator_human_template):
            raise ValueError("You must provide system and human validator templates.")

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

        attempts = 0
        while attempts < max_retries:
            valid, error_message = validate_plan(domain_path, problem_path, plan_path)

            if valid:
                print("[✓] Plan validated successfully.")
                return True

            print(f"\n[Attempt {attempts + 1}] Validating the plan...\n")
            print(f"[✗] Plan validation failed:\n{error_message}\n")

            # Invoca il LLM per correggere i file
            chain = prompt_template | self.llm
            response = chain.invoke({
                "error": error_message,
                "lore": lore_document,
                "domain": domain_text,
                "problem": problem_text,
                "plan": plan_text
            })
            content = response.content

            domain = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
            problem = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)
            corrected_domain_pddl = domain.group(1).strip()
            corrected_problem_pddl = problem.group(1).strip()

            domain_text = corrected_domain_pddl
            problem_text = corrected_problem_pddl
            attempts += 1

        with open(domain_path, 'w', encoding="utf-8") as f:
                f.write(corrected_domain_pddl)
        with open(problem_path, 'w', encoding="utf-8") as f:
                f.write(corrected_problem_pddl)

        print("[✗] Maximum number of correction attempts reached. Plan still invalid.")
        return False
    

    #TODO: ogni volta che sistemiamo gli errori del validator (modificando i file) il piano va RIGENERATO.
    def correct_errors(max_retries: int = 3):
         pass