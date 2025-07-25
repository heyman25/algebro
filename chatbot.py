from google import genai
from google.genai import types

client = genai.Client()

def get_feedback(question, answer):

    prompt = f"""You are a helpful math tutor, a student has answered this 
    question: {question}, with this answer: {answer}. Please give them feedback.
    Additionally in a new line put Answer: 1, if you think they need to try a
    similar question, or Answer: 0, if you think they need to try a different question.
    """
    content = f""

    response = client.models.generate_content(
        model = "gemini-2.5-flash", contents=content,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0)
        ),
    )
    return response.text

