from sentence_transformers import SentenceTransformer
from pylatexenc.latex2text import LatexNodes2Text
import os
import re

model = SentenceTransformer("all-MiniLM-L6-v2")

cat = {
    1: "Functions_and_graphs",
    2: "Sequences_and_series",
    3: "Vectors",
    4: "Intro_to_complex_numbers",
    5: "Calculus",
    6: "Probability_and_Stats",
    7: "Random"
}

beginning = r"""
%% LyX 2.3.6.1 created this file. For more info, see http://www.lyx.org/.
%% Do not edit unless you really know what you are doing.
\documentclass[english]{article}
\usepackage[T1]{fontenc}
\usepackage[latin9]{inputenc}
\usepackage{geometry}
\geometry{verbose,tmargin=2.5cm,bmargin=2.5cm,lmargin=2.5cm,rmargin=2.5cm}
\usepackage{color}
\usepackage{setspace}
\PassOptionsToPackage{normalem}{ulem}
\usepackage{ulem}

\makeatletter

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% LyX specific LaTeX commands.
%% Because html converters don't know tabularnewline
\providecommand{\tabularnewline}{\\}

\makeatother

\usepackage{babel}
\begin{document}
"""

end = r"""\end{document}"""

def convert_latex_question(latex_str: str) -> str:
    # Convert LaTeX to plain text and format integrals nicely
    text = LatexNodes2Text().latex_to_text(latex_str)
    math_parts = re.findall(r'∫.*?dx', text)
    for mp in math_parts:
        text = text.replace(mp, f"\n{mp}\n")
    return text.strip()

def load_questions(category_id: int) -> list[str]:
    folder = cat.get(category_id)
    if not folder:
        raise ValueError(f"Invalid category ID: {category_id}")
    questions = []
    for filename in os.listdir(folder):
        with open(os.path.join(folder, filename), "r") as f:
            raw = f.read()
            full_latex = beginning + raw + end
            questions.append(full_latex)
    return questions

def get_question_text_and_embedding(question_latex: str):
    text = convert_latex_question(question_latex)
    embedding = model.encode(text)
    return text, embedding

def select_next_question(current_embedding, questions: list[str], is_difficult: bool) -> str:
    comparisons = []
    for q in questions:
        emb = model.encode(convert_latex_question(q))
        sim = model.similarity(emb, current_embedding)
        comparisons.append((sim.item(), q))
    if is_difficult:
        next_question = max(comparisons, key=lambda x: x[0])[1]
    else:
        next_question = min(comparisons, key=lambda x: x[0])[1]
    return next_question
