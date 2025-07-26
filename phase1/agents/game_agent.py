import re
from threading import Thread
from queue import Queue
from utils import get_llm, read_file
from agents.image_agent import ImageAgent
from pddlsim.parser import parse_domain, parse_problem
from pddlsim.simulation import Simulation

from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)


class GameAgent:
    def __init__(
        self,
        system_template: str,
        human_template: str,
        image_agent: ImageAgent,
        lore_path: str = "pddl/lore.txt",
        domain_path: str = "pddl/domain.pddl" ,
        problem_path: str = "pddl/problem.pddl",
        model: str = "gemini-2.0-flash",
    ):
        self.system_template = system_template
        self.human_template = human_template
        self.llm = get_llm(model)
        self.image_agent = image_agent
        self.lore_path = lore_path
        self.domain_path = domain_path
        self.problem_path = problem_path

        self.lore_text = None
        self.domain_text = None
        self.problem_text = None

        self.simulation = None
        self.input_queue = Queue()
        self.output_queue = Queue()
        self.workflow_thread = None
        self.is_running = False

    def _get_simulation(self):
        domain = parse_domain(self.domain_text)
        problem = parse_problem(self.problem_text, domain)
        simulation = Simulation.from_domain_and_problem(domain, problem)
        return simulation

    def _get_current_state_and_feasibile_actions(self, sim_actions_list, sim_state_list):
        raw_current_state = "\n".join(map(str, sim_state_list))
        raw_current_actions = "\n".join(map(str, sim_actions_list))
        
        print("Azioni RAW:")
        print(raw_current_actions)

        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(self.system_template),
            HumanMessagePromptTemplate.from_template(self.human_template)
        ])
        chain = prompt_template | self.llm
        response = chain.invoke({
            "lore": self.lore_text,
            "domain": self.domain_text,
            "problem": self.problem_text,
            "current_state": raw_current_state,
            "actions": raw_current_actions
        })

        content = response.content
        state_match = re.search(r"<state>(.*?)</state>", content, re.DOTALL)
        state = state_match.group(1).strip() if state_match else ""
        action_matches = re.findall(r"<action>(.*?)</action>", content, re.DOTALL)
        actions = [m.strip() for m in action_matches]

        return state, actions

    def send_action(self, user_input: str) -> dict:
        if not self.is_running:
            raise ValueError("Agente non attivo")
        self.input_queue.put(user_input)
        response = self.output_queue.get()
        return response

    def run(self):
        self.lore_text = read_file(self.lore_path)
        self.domain_text = read_file(self.domain_path)
        self.problem_text = read_file(self.problem_path)
        self.simulation = self._get_simulation()

        while True:
            if self.simulation.is_solved():
                self.output_queue.put({
                    "state": "WIN",
                    "actions": "",
                    "image_url": "https://placehold.co/1792x1024/555555/FFFFFF?text=WIN"
                })
                break

            sim_actions_list = list(self.simulation.get_grounded_actions())
            sim_state_list = list(self.simulation.state)

            print("Lista azioni di simulazione:")
            print(sim_actions_list)

            if not sim_actions_list:
                self.output_queue.put({
                    "state": "GAME-OVER",
                    "actions": "",
                    "image_url": "https://placehold.co/1792x1024/555555/FFFFFF?text=GAME+OVER"
                })
                break

            state, actions = self._get_current_state_and_feasibile_actions(
                sim_actions_list, sim_state_list
            )

            actions_dict = {i: act for i, act in enumerate(actions)}
            print("actions_dict:")
            print(actions_dict)

            image_url = "https://placehold.co/1792x1024/555555/FFFFFF?text=STATE" #self.image_agent.get_image_url(user_input = state)

            self.output_queue.put({
                "state": state,
                "actions": actions_dict,
                "image_url": image_url
            })

            try:
                user_action_id = int(self.input_queue.get())
                chosen = sim_actions_list[user_action_id]
                self.simulation.apply_grounded_action(chosen)
            except (ValueError, IndexError):
                print("❌ Indice non valido. Simulazione interrotta.")
                break

        return 

    def start_game(self):
        self.is_running = True
        self.workflow_thread = Thread(target=self.run)
        self.workflow_thread.daemon = True
        self.workflow_thread.start()
        initial_response = self.output_queue.get()
        return initial_response

    def is_active(self) -> bool:
        return self.is_running
