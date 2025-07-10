from langchain.prompts import (ChatPromptTemplate, 
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
import re


class PDDLAgent():
    def __init__(self, system_template: str, human_template: str, model: str = "gemini-2.5-pro"):
        self.system_template = system_template
        self.human_template = human_template
        self.llm = get_llm(model)


    def generate_pddl(self, lore_document_path: str = "pddl/lore.txt", pddl_path: str = "pddl"):
        print("\nGenerating PDDL files...")
        lore_document = read_file(lore_document_path)
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(self.system_template),
            HumanMessagePromptTemplate.from_template(self.human_template),
        ])
        chain = prompt | self.llm
        response = chain.invoke(input={"lore": lore_document})
        content = response.content

        domain = re.search(r"<domain>(.*?)</domain>", content, re.DOTALL)
        problem = re.search(r"<problem>(.*?)</problem>", content, re.DOTALL)
        domain_pddl = domain.group(1).strip()
        problem_pddl = problem.group(1).strip()

        os.makedirs(pddl_path, exist_ok=True)
        domain_path = f"{pddl_path}/domain.pddl"
        problem_path = f"{pddl_path}/problem.pddl"

        with open(domain_path, "w", encoding="utf-8") as f:
            f.write(domain_pddl)
        with open(problem_path, "w", encoding="utf-8") as f:
            f.write(problem_pddl)

    