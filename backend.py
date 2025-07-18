from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np

from Algebro import load_questions, get_question_text_and_embedding, select_next_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store per-user session questions — ideally replace with a proper DB or cache for real apps
questions_by_user = {}

class NextInput(BaseModel):
    current_embedding: List[float]
    remaining_questions: List[str]
    is_difficult: bool

@app.get("/questions/{category_id}")
def get_initial_question(category_id: int):
    try:
        questions = load_questions(category_id)
    except ValueError as e:
        return {"error": str(e)}
    if not questions:
        return {"error": "No questions found"}
    current_question = questions[0]
    remaining = questions[1:]
    text, embedding = get_question_text_and_embedding(current_question)
    questions_by_user[category_id] = {
        "current_embedding": embedding,
        "remaining_questions": remaining
    }
    return {"content": text, "embedding": embedding.tolist(), "remaining_questions": remaining}

@app.post("/questions/next")
def get_next_question(payload: NextInput):
    if not payload.remaining_questions:
        return {"error": "No more questions remaining"}

    current_embedding = np.array(payload.current_embedding)
    next_q = select_next_question(current_embedding, payload.remaining_questions, payload.is_difficult)
    text, embedding = get_question_text_and_embedding(next_q)
    
    # Remove selected question from remaining
    new_remaining = [q for q in payload.remaining_questions if q != next_q]
    
    return {
        "content": text,
        "embedding": embedding.tolist(),
        "remaining_questions": new_remaining
    }
