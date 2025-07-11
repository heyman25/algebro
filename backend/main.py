from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import random

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Categories mapping
CATEGORIES = {
    1: "Functions_and_graphs",
    2: "Sequences_and_series",
    3: "Vectors",
    4: "Intro_to_complex_numbers",
    5: "Calculus",
    6: "Probability_and_Stats",
    7: "Random"
}

class QuestionResponse(BaseModel):
    content: str
    id: str

class DifficultyFeedback(BaseModel):
    question_id: str
    is_difficult: bool
    category_id: int

def get_questions_for_category(category_id: int) -> List[str]:
    if category_id not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    category_path = CATEGORIES[category_id]
    questions = []
    
    try:
        questions_path = os.listdir(category_path)
        for file_name in questions_path:
            with open(f"{category_path}/{file_name}", "r") as f:
                questions.append(f.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading questions: {str(e)}")
    
    return questions

@app.get("/questions/{category_id}")
async def get_initial_question(category_id: int) -> QuestionResponse:
    questions = get_questions_for_category(category_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this category")
    
    # Return a random question
    question = random.choice(questions)
    return QuestionResponse(content=question, id=str(hash(question)))

@app.post("/questions/next")
async def get_next_question(feedback: DifficultyFeedback) -> QuestionResponse:
    questions = get_questions_for_category(feedback.category_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this category")
    
    # For now, just return a random question
    question = random.choice(questions)
    return QuestionResponse(content=question, id=str(hash(question))) 