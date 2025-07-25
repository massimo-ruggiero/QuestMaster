import os
import yaml
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper

with open('config.yaml', 'r') as file:
    config = yaml.safe_load(file)

os.environ["OPENAI_API_KEY"] = config.get('OPENAI_API_KEY_M', "")

dalle = DallEAPIWrapper(model="dall-e-3", size="1792x1024", quality="standard") 

prompt_immagine = "Un paesaggio montano con un lago cristallino all'alba, stile impressionista"

print(f"Sto generando un'immagine per: '{prompt_immagine}'...")

image_url = dalle.run(prompt_immagine)

print(f"\nImmagine generata con successo!\nURL dell'immagine (temporaneo): {image_url}")