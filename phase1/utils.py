from typing import Tuple, Optional
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
import subprocess
import shutil
import os
import sys
import yaml


with open('config.yaml', 'r') as file:
    config = yaml.safe_load(file)


def read_file(path: str = "pddl/lore.txt") -> str:
    if not os.path.exists(path):
            raise FileNotFoundError(f"{path} not found!")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
    

def write_file(path: str, content: str) -> str:
    with open(path, 'w', encoding="utf-8") as f:
        f.write(content)
        f.flush()
        os.fsync(f.fileno())


def save_workflow_img(dir: str, img_name: str, png_bytes: str):
    workflow_img_path = f"{dir}/{img_name}.png"
    if not os.path.exists(workflow_img_path):
        os.makedirs(dir, exist_ok=True)
        with open(workflow_img_path, "wb") as f:
            f.write(png_bytes)


def get_llm(model: str = "gpt-4.1-nano"):
    if "gpt" in model:
        return ChatOpenAI(
            model=model,
            temperature=0,
            max_retries=3,
            api_key=config.get('OPENAI_API_KEY_M', ""),
        )
    elif "gemini" in model:
        return ChatGoogleGenerativeAI(
            model=model,
            temperature=0,
            max_retries=3,
            api_key=config.get('GEMINI_API_KEY', "")
        )
    else:
        raise ValueError(f"Unsupported model: {model}")

def get_image_model(model: str = "dall-e-3", size: str ="1024x1024", quality: str ="standard"):
    return DallEAPIWrapper(api_key= config.get('OPENAI_API_KEY_M', ""), 
                           model= model, 
                           size= size, 
                           quality= quality)


def generative_system_template(template: str, examples_path: str = "examples") -> str:
    def read_example(example_name: str) -> str:
        example_dir = os.path.join(examples_path, example_name)
        try:
            with open(os.path.join(example_dir, "lore.txt"), "r", encoding="utf-8") as f:
                lore = f.read().strip()
            with open(os.path.join(example_dir, "domain.pddl"), "r", encoding="utf-8") as f:
                domain = f.read().strip()
            with open(os.path.join(example_dir, "problem.pddl"), "r", encoding="utf-8") as f:
                problem = f.read().strip()
        except FileNotFoundError as e:
            raise ValueError(f"Missing file in {example_name}: {e.filename}")
        return (
            f"Q: ## 📝 Input\n\nBased on the following lore, generate the domain and problem files as required.\n\nLORE INPUT:\n```\n{lore}\n```\n\n"
            f"A: <domain>\n{domain}\n</domain>\n"
            f"<problem>\n{problem} \n</problem>\n"
        )
    example1_content = read_example("example1")
    example2_content = read_example("example2")

    filled_template = template.replace("{example1}", example1_content)\
                              .replace("{example2}", example2_content)
    return filled_template



def fill_lore_system_template(template: str, examples_path: str = "examples/lore") -> str:
    def read_example(example_name: str) -> str:
        example_dir = os.path.join(examples_path, example_name)
        try:
            with open(os.path.join(example_dir, "lore.txt"), "r", encoding="utf-8") as f:
                lore = f.read().strip()
        except FileNotFoundError as e:
            raise ValueError(f"Missing file in {example_name}: {e.filename}")
        return lore

    example1_content = read_example("example1")
    example2_content = read_example("example2")

    filled_template = template.replace("{example1}", example1_content)\
                              .replace("{example2}", example2_content)
    return filled_template




def generate_plan(domain_path: str  = "pddl/domain.pddl" , problem_path: str = "pddl/problem.pddl", plan_dir: str = "pddl") -> Tuple[bool, Optional[str]]:
    plan_path = os.path.join(plan_dir, "sas_plan")
    if os.path.exists(plan_path):
        os.remove(plan_path)

    cmd = ["downward/fast-downward.py", domain_path, problem_path, "--search", "astar(lmcut())"]
    cp = subprocess.run(cmd, capture_output=True, text=True)

    raw_output = (cp.stdout or "") + (cp.stderr or "")
    lines = raw_output.splitlines()

    start_idx = None
    for i, line in enumerate(lines):
        if line.startswith("INFO") and "translator command line string" in line:
            start_idx = i
            break

    if start_idx is not None:
        useful_lines = lines[start_idx+1:]
    else:
        useful_lines = [l for l in lines if not l.startswith("INFO")]
    clean_output = "\n".join(useful_lines).strip()

    if cp.returncode != 0:
        #print(clean_output, file=sys.stderr)
        return False, clean_output

    os.makedirs(plan_dir, exist_ok=True)
    shutil.move("sas_plan", plan_dir)
    print("Plan generated successfully")
    return True, None



def validate_plan(domain_path: str, problem_path: str = "pddl/problem.pddl", plan_path: str = "pddl/sas_plan") -> Tuple[bool, Optional[str]]:
    cmd = ["./VAL/build/macos64/Release/bin/Validate", "-v", domain_path, problem_path, plan_path]
    cp = subprocess.run(cmd, capture_output=True, text=True)
    
    if cp.stdout:
        print(cp.stdout, end="")
    if cp.stderr:
        print(cp.stderr, end="", file=sys.stderr)

    if cp.returncode != 0:
        error_message = f"Validation failed (exit code {cp.returncode})\n{cp.stderr}"
        print(error_message, file=sys.stderr)
        return False, error_message
    
    return True, None
