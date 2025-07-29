from utils import get_image_model

class ImageAgent:
    def __init__(self, style_description: str, system_template: str ):
        self.style_description = style_description
        self.system_template = system_template
        self.model = get_image_model()

    def _build_prompt(self, user_input: str) -> str:
        return self.system_template.format(
            input=user_input,
            style=self.style_description
        )

    def get_image_url(self, user_input: str) -> str:
        prompt = self._build_prompt(user_input)
        return self.model.run(prompt)
