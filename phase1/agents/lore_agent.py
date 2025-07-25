import os
import re
from threading import Thread
from agents.pddl_agent import PDDLAgent
from agents.reflective_agent import ReflectiveAgent
from queue import Queue
from utils import get_llm, write_file,save_workflow_img
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain.schema import HumanMessage, SystemMessage, AIMessage


class State(TypedDict):
    messages: Annotated[list, add_messages]
    exit: bool
    save: bool


class LoreAgent:
    def __init__(self, system_template: str, 
                 model: str = "gpt-4.1-nano", 
                 pddl_path: str = "pddl",):
        self.system_template = system_template
        self.llm = get_llm(model)
        self.pddl_path = pddl_path
        self.workflow = self._build_workflow()

        self.input_queue = Queue()
        self.output_queue = Queue()
        self.workflow_thread = None
        self.is_running = False
       

    def _build_workflow(self):
        workflow = StateGraph(State)

        def input_node(state: State) -> State:
            user_input = self.input_queue.get()
            if user_input is None:  
                return {"exit": True, "save": False}
            elif user_input == "SAVE_TRIGGER":
                return {"exit": False, "save": True}
            usr = HumanMessage(content=user_input)
            new_messages = state["messages"] + [usr]
            return {"messages": new_messages, "exit": False, "save": False}


        def chat_node(state: State) -> State:
            resp = self.llm.invoke(state["messages"])
            ai = AIMessage(content=resp.content)
            self.output_queue.put({
                "message": ai.content,
                "action": "continue"
            })
            new_messages = state["messages"] + [ai]
            return {"messages": new_messages, "exit": False}


        def save_node(state: State) -> State:
            pattern = re.compile(r"<lore>(.*?)</lore>", re.DOTALL)
            lore_text = None
            for msg in reversed(state["messages"]):
                if isinstance(msg, AIMessage):
                    match = pattern.search(msg.content)
                    if match:
                        lore_text = match.group(1).strip()
                        break

            if not lore_text:
                print("Assistant: Nessun messaggio contiene un blocco <lore>.")
                return
            os.makedirs(self.pddl_path, exist_ok=True)
            file_path = os.path.join(self.pddl_path, "lore.txt")
            write_file(file_path, lore_text)
            self.output_queue.put({
                "message": f"Lore salvato in: {file_path}",
                "action": "save"
            })
            self.is_running = False
            return state
        

        def next_step_conditional_routing(state: State) -> str:
            if state.get("save", False):
                return "save_lore"
            elif state.get("exit", False):
                return "exit"
            else:
                return "continue"


        workflow.add_node("input", input_node)
        workflow.add_node("chat", chat_node)
        workflow.add_node("save", save_node)

        workflow.add_edge(START, "input")
        workflow.add_conditional_edges(
            "input",
            next_step_conditional_routing,
            {"save_lore": "save","continue": "chat", "exit": END}
        )
        workflow.add_edge("chat", "input")
        workflow.add_edge("save", END)

        compiled_workflow = workflow.compile()

        workflow_img_path = "phase1/images/"
        workflow_img_name = "workflow_lore_agent.png"
        png_bytes = compiled_workflow.get_graph().draw_mermaid_png()
        save_workflow_img(workflow_img_path,workflow_img_name,png_bytes)
        
        return compiled_workflow


    def _run_workflow(self):
        try:
            sys_msg = SystemMessage(content=self.system_template)
            initial_state: State = {
                "messages": [sys_msg],
                "exit": False, 
                "save": False
            }
            
            self.output_queue.put({
                "message": "Chat inizializzata. Dimmi cosa hai in mente per il lore.",
                "action": "continue"
            })
            self.workflow.invoke(initial_state)
            
        except Exception as e:
            self.output_queue.put({
                "message": f"Errore nel workflow: {str(e)}",
                "action": "error"
            })
        finally:
            self.is_running = False
    

    def start_chat(self):
        if self.is_running:
            return {"message": "Chat già attiva", "action": "continue"}
        
        self.is_running = True
        self.workflow_thread = Thread(target=self._run_workflow)
        self.workflow_thread.daemon = True
        self.workflow_thread.start()
        
        initial_response = self.output_queue.get()
        return initial_response
    

    def send_message(self, user_input: str) -> dict:
        if not self.is_running:
            raise ValueError("Chat non attiva. Chiama start_chat() prima.")
        self.input_queue.put(user_input)
        response = self.output_queue.get()
        return response
    

    def save_lore(self):
        if not self.is_running:
            raise ValueError("Chat non attiva. Chiama start_chat() prima.")
        self.input_queue.put("SAVE_TRIGGER")
        response = self.output_queue.get()
        return response
    

    def stop_chat(self):
        if self.is_running:
            self.input_queue.put(None)  
            self.is_running = False
            if self.workflow_thread and self.workflow_thread.is_alive():
                self.workflow_thread.join(timeout=5.0)
                if self.workflow_thread.is_alive():
                    print("Warning: Thread non terminato correttamente")

    
    def restart_chat(self):
        self.stop_chat()
        return self.start_chat()
    

    def is_active(self) -> bool:
        return self.is_running