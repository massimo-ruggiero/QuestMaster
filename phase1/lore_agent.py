from langchain.prompts import (ChatPromptTemplate, 
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
import re
import os


class LoreAgent():
    def __init__(self, system_template: str, human_template: str, model: str = "gpt-4.1-nano", pddl_path: str = "pddl"):
        self.system_template = system_template
        self.human_template = human_template
        self.model = model
        self.pddl_path = pddl_path
        self.llm = get_llm(model)


    def generate_lore(self, lore_path: str = "pddl/lore.txt"):
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(self.sys_template),
            HumanMessagePromptTemplate.from_template(self.human_template),
        ])
        chain = prompt | self.llm
        response = chain.invoke()
        content = response.content

        lore = re.search(r"<lore>(.*?)</lore>", content, re.DOTALL)
        lore_document = lore.group(1).strip()

        os.makedirs(self.pddl_path, exist_ok=True)
        with open(lore_path, "w", encoding="utf-8") as f:
            f.write(lore_document)