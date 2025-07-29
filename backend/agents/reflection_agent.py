from typing import TypedDict, Optional
from langchain.prompts import (ChatPromptTemplate,  
                               SystemMessagePromptTemplate, 
                               HumanMessagePromptTemplate)
from utils import *
from queue import Queue
from threading import Thread
from langgraph.graph import StateGraph, START, END
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter
from typing import List
import re
import os               


class GraphState(TypedDict):
    domain_path: str
    problem_path: str
    plan_dir: str
    lore_document_path: str

    max_retries_planner: int
    max_retries_incoherence: int
    max_retries_rag: int
    max_retries_validator: int
    planner_attempts: int
    incoherence_attempts: int
    rag_attempts: int
    validator_attempts: int

    planner_error_fixed: bool
    incoherence_error_fixed: bool
    validator_error_fixed: bool
    error_message: Optional[str]
    rag_trigger: bool


class ReflectionAgent:
    def __init__(self, 
                 planner_system_template: str, 
                 planner_human_template: str, 
                 check_incoherence_system_template: str, 
                 check_incoherence_human_template: str,
                 fix_incoherence_system_template: str, 
                 fix_incoherence_human_template: str, 
                 retrieval_system_template: str,
                 retrieval_human_template: str,
                 rag_system_template: str,
                 rag_human_template: str,
                 validator_system_template: str, 
                 validator_human_template: str,
                 rag_documents_dir: str = "rag_documents",
                 model: str = "gpt-4.1-nano",):
        
        self.planner_system_template = planner_system_template
        self.planner_human_template = planner_human_template
        self.check_incoherence_system_template = check_incoherence_system_template
        self.check_incoherence_human_template = check_incoherence_human_template
        self.fix_incoherence_system_template = fix_incoherence_system_template
        self.fix_incoherence_human_template = fix_incoherence_human_template
        self.retrieval_system_template = retrieval_system_template
        self.retrieval_human_template = retrieval_human_template
        self.rag_system_template = rag_system_template
        self.rag_human_template = rag_human_template
        self.validator_system_template = validator_system_template
        self.validator_human_template = validator_human_template

        self.plan_dir = "pddl"
        self.domain_path = "pddl/domain.pddl"
        self.problem_path = "pddl/problem.pddl"
        self.lore_document_path = "pddl/lore.txt"
        self.plan_path = "pddl/sas_plan"

        self.llm = get_llm(model)
        self.workflow = self._build_workflow()

        self.embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.embeddings_model = HuggingFaceEmbeddings(model_name=self.embedding_model_name)
        self.rag_documents_dir = rag_documents_dir
        self.vector_store = self._build_reference_lore_vectore_store()

        self.workflow_thread = None
        self.output_queue = Queue()


    def _build_reference_lore_vectore_store(self) -> InMemoryVectorStore:
        store = InMemoryVectorStore(self.embeddings_model)
        print("Building vector store...")
        headers_to_split_on = [('##', 'SectionTitle')]

        markdown_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=headers_to_split_on,
            strip_headers=False
        )
        
        for dir in os.listdir(self.rag_documents_dir):
            dir_path = os.path.join(self.rag_documents_dir, dir)

            lore_path = os.path.join(dir_path, 'lore.txt')
            summary_path = os.path.join(dir_path, 'summary.txt')

            if os.path.exists(lore_path) and os.path.exists(summary_path):
                lore_text = read_file(lore_path).strip()
                summary_content = read_file(summary_path).strip()

                section_chunks: List[Document] = markdown_splitter.split_text(lore_text) 
                for i, chunk in enumerate(section_chunks):
                    chunk.page_content = f'{summary_content}\n{chunk.page_content}'
                    chunk.metadata.update({
                        "source_folder": dir,
                        "chunk_index": i
                    })
                store.add_documents(section_chunks)
            else:
                print(f"Warning: 'lore.txt' or 'summary.txt' not found in '{dir_path}'. Skipping.")

        print("[✓] Vector state ready.")
        return store


    def _build_workflow(self):

        # 1. GENERATE THE PLAN
        def check_plan_generation(state: GraphState) -> GraphState:
            planner_attempts = state['planner_attempts']
            
            generated, error_message = generate_plan()
            if generated:
                self.output_queue.put({"event":"status","message":"Plan successfully generated."})
                print("[✓] Files are correct and plan has been generated.")
                return {"planner_error_fixed": True, "error_message": None}
            else:
                self.output_queue.put({"event":"status","message":"Fixing PDDL files..."})
                print(f"\n[Fixing planner errors - Attempt {planner_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"planner_error_fixed": False, "error_message": error_message, "planner_attempts": planner_attempts + 1}


        def fix_planner_errors_node(state: GraphState) -> GraphState:
            error_message = state['error_message']

            lore_document = read_file(self.lore_document_path)
            domain_text = read_file(self.domain_path)
            problem_text = read_file(self.problem_path)

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
                write_file(self.domain_path, fixed_domain_pddl)
                write_file(self.problem_path, fixed_problem_pddl)
                self.output_queue.put({"event":"status","message":"PDDL files has been fixed by the agent."})
                print("[✓] Files has been fixed by the agent.\n")
            else:
                self.output_queue.put({"event":"status","message":"Parsing error."})
                print("[✗] Impossibile parsing files from the agent's output.")

            return {}
        

        # 2. PLAN'S COHERENCE
        def check_lore_incoherence(state: GraphState) -> GraphState:
            incoherence_attempts = state['incoherence_attempts']

            lore_document = read_file(self.lore_document_path)
            domain_text = read_file(self.domain_path)
            problem_text = read_file(self.problem_path)
            plan_text = read_file(self.plan_path)

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
                self.output_queue.put({"event":"status","message":"Consistency check passed."})
                print("[✓] Files are coherente with lore document.")
                return {'incoherence_error_fixed': True, "error_message": None}
            else:
                self.output_queue.put({"event":"status","message":"Fixing incoherence errors..."})
                print(f"\n[Fixing incoherence errors - Attempt {incoherence_attempts + 1}]\nIncoherence report:\n{content}\n")
                return {"incoherence_error_fixed": False, "error_message": content, "incoherence_attempts": incoherence_attempts + 1}


        def fix_lore_incoherence_node(state: GraphState) -> GraphState:
            error_message = state['error_message']
            rag_attempts = state['rag_attempts']

            lore_document = read_file(self.lore_document_path)
            domain_text = read_file(self.domain_path)
            problem_text = read_file(self.problem_path)
            plan_text = read_file(self.plan_path)

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
            rag_trigger = "RAG_TRIGGER" in content.strip()

            if domain_match and problem_match:
                fixed_domain_pddl = domain_match.group(1).strip()
                fixed_problem_pddl = problem_match.group(1).strip()
                write_file(self.domain_path, fixed_domain_pddl)
                write_file(self.problem_path, fixed_problem_pddl)
                self.output_queue.put({"event":"status","message":"PDDL files has been fixed by the agent."})
                print("[✓] domain.pddl and problem.pddl have been fixed by the agent to make them coherent with the lore.\n")
                return {"planner_attempts": 0, "rag_trigger": False}
            elif rag_trigger:
                self.output_queue.put({"event":"status","message":"Resolving lore inconsistencies via RAG."})
                print(f"[Fixing incoherence errors via RAG - Attempt {rag_attempts + 1}]")
                return {"planner_attempts": 0, "rag_trigger": True, "rag_attempts": rag_attempts + 1}
            else:
                self.output_queue.put({"event":"status","message":"Parsing error..."})
                print("[✗] Impossibile parsing files from the agent's output.")
                return {"incoherence_error_fixed": False, "rag_trigger": False}
        

        def RAG_node(state: GraphState) -> GraphState:
            lore_document = read_file(self.lore_document_path)
            error_message = state['error_message']

            self.output_queue.put({"event":"status","message":"Analyzing current lore for lore for summary details..."})
            print("Analyzing current lore for style and keywords...")

            retrieval_query_prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.retrieval_system_template),
                HumanMessagePromptTemplate.from_template(self.retrieval_human_template)
            ]) 
            chain = retrieval_query_prompt | self.llm
            retrieval_query = chain.invoke({"lore": lore_document, "error_message": error_message}).content

            self.output_queue.put({"event":"status","message":f"The agent generated the retrieval query."})
            print(f"[✓] LLM generated retrieval query:\n{retrieval_query}\n")

            retrieved_chunks = self.vector_store.similarity_search(query=retrieval_query, k=2)
            retrieved_content = "\n\n".join(chunk.page_content for chunk in retrieved_chunks)
            self.output_queue.put({"event":"status","message":"Chunks retrieved from vector store."})
            print(f"[✓] Reference lore retrieved. \n\n{retrieved_content}\n")

            self.output_queue.put({"event":"status","message":"Updating Lore document using retrieved chunks..."})
            print("[...] Generating updated Lore document...")
            
            rag_generation_prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.rag_system_template),
                HumanMessagePromptTemplate.from_template(self.rag_human_template)
            ])
            rag_generation_chain = rag_generation_prompt | self.llm 
            response = rag_generation_chain.invoke({
                "lore": lore_document,
                "error_message": error_message,
                "retrieved_content": retrieved_content
            })
            content = response.content
            lore_match = re.search(r"<lore>(.*?)</lore>", content, re.DOTALL)
            
            if lore_match:
                updated_lore_text = lore_match.group(1).strip()
                write_file(path="pddl/lore.txt", content=updated_lore_text)
                self.output_queue.put({"event":"status","message":"Lore document fixed by the agent."})
                print("[✓] Lore document has been updated...\n")
            else:
                self.output_queue.put({"event":"status","message":"Parsing error..."})
                print("[✗] Impossibile parsing Lore document from the agent's output.")
            
            return {"planner_attempts": 0, "rag_trigger": False}
        

        # 3. VALIDATE THE PLAN
        def check_plan_validation(state: GraphState) -> GraphState:
            validator_attempts = state['validator_attempts']
            
            valid, error_message = validate_plan(self.domain_path, self.problem_path, self.plan_path)
            if valid:
                self.output_queue.put({"event":"status","message":"Plan validated successfully."})
                print("[✓] Plan validated successfully")
                return {"validator_error_fixed": True, "error_message": None}
            else:
                self.output_queue.put({"event":"status","message":"Fixing validator errors..."})
                print(f"\n[Fixing validator errors - Attempt {validator_attempts + 1}]\nPlanner error:\n{error_message}\n")
                return {"validator_error_fixed": False, "error_message": error_message, "validator_attempts": validator_attempts + 1}
            
        
        def fix_validator_errors_node(state: GraphState) -> GraphState:
            error_message = state['error_message']

            lore_document = read_file(self.lore_document_path)
            domain_text = read_file(self.domain_path)
            problem_text = read_file(self.problem_path)
            plan_text = read_file(self.plan_path)

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

                write_file(self.domain_path, fixed_domain_pddl)
                write_file(self.problem_path, fixed_problem_pddl)

                self.output_queue.put({"event":"status","message":"PDDL files has been fixed by the agent."})
                print("[✓] Files has been fixed by the agent.\n")
            else:
                self.output_queue.put({"event":"status","message":"Parsing error..."})
                print("[✗] Impossibile parsing files from the agent's output.")

            return {"planner_attempts": 0, "incoherence_attempts": 0, "rag_attempts": 0}


        def next_step_conditional_routing(state: GraphState, prefix: str) -> str:
            error_fixed_key = f"{prefix}_error_fixed"
            attempts_key = f"{prefix}_attempts"
            max_retries_key = f"max_retries_{prefix}"

            if state[error_fixed_key]:
                return 'SUCCESS'
            if not state[error_fixed_key] and state[attempts_key] < state[max_retries_key]:
                return "fix_errors"
            return "max_retries_reached"
        

        def next_step_RAG_conditional_routing(state: GraphState) -> str:
            if state.get("rag_attempts") >= state.get("max_retries_rag"):
                return "max_retries_reached"
            elif state.get("rag_trigger"):
                return "RAG"
            else: 
                return "generate_plan"
                
        
        workflow = StateGraph(GraphState)
        workflow.add_node("check_plan_generation", check_plan_generation)
        workflow.add_node("fix_planner_errors_node", fix_planner_errors_node)
        workflow.add_node("check_lore_incoherence", check_lore_incoherence) 
        workflow.add_node("fix_lore_incoherence_node", fix_lore_incoherence_node)
        workflow.add_node("RAG_node", RAG_node)
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
        workflow.add_conditional_edges(
            "fix_lore_incoherence_node",
            lambda state: next_step_RAG_conditional_routing(state),
            {
                "RAG": "RAG_node",
                "generate_plan": "check_plan_generation",
                "max_retries_reached": END
            }
        )
        workflow.add_edge("RAG_node", "check_lore_incoherence")

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
        save_workflow_img("backend/images", "workflow_reflective_agent", png_bytes)

        return compiled_workflow
        

    def _check_and_fix_errors(self,
                       max_retries_planner: int = 10,
                       max_retries_incoherence: int = 10,
                       max_retries_rag: int = 5,
                       max_retries_validator: int = 5) -> bool:
        
        print("\n--- STARTING ERROR CORRECTION WORKFLOW ---")

        initial_state: GraphState = {
            "max_retries_planner": max_retries_planner,
            "max_retries_incoherence": max_retries_incoherence,
            "max_retries_rag": max_retries_rag,
            "max_retries_validator": max_retries_validator,
            "planner_attempts": 0,
            "incoherence_attempts": 0,
            "rag_attempts": 0,
            "validator_attempts": 0,

            "planner_error_fixed": False,
            "incoherence_error_fixed": False,
            "validator_error_fixed": False,
            "error_message": None,
            "rag_trigger": False
        }

        state = self.workflow.invoke(initial_state, {"recursion_limit": 100})

        if state['planner_error_fixed'] and state['incoherence_error_fixed'] and state['validator_error_fixed']:
            self.output_queue.put({"event":"success","message":"Plan has been generated and validated succesfully."})
            print("\n--- WORKFLOW COMPLETED SUCCESSFULLY: Plan generated and validated! ---")
            return True
        else:
            self.output_queue.put({"event":"fail","message":"Unable to generate and validate plan within max retries."})
            print("\n--- WORKFLOW FAILED: Unable to generate and validate plan within max retries. ---")
            if state['error_message']:
                print(f"Last error: {state['error_message']}")
            return False
        
    
    def run(self,
            max_retries_planner: int = 10,
            max_retries_incoherence: int = 10,
            max_retries_rag: int = 5,
            max_retries_validator: int = 5):
        
        self.workflow_thread = Thread(
            target=self._check_and_fix_errors,
            args=(
                max_retries_planner,
                max_retries_incoherence,
                max_retries_rag,
                max_retries_validator
            )
        )
        self.workflow_thread.daemon = True
        self.workflow_thread.start()

        while True:
            msg = self.output_queue.get()
            yield msg
            if msg.get("event") == "success" or msg.get("event") == "fail":
                break