from sentence_transformers import SentenceTransformer
from pylatexenc.latex2text import LatexNodes2Text
import os
import re

#model config
model = SentenceTransformer("all-MiniLM-L6-v2")


def convert_latex_question(latex_str):
    # Clean using pylatexenc
    text = LatexNodes2Text().latex_to_text(latex_str)

    # Extract math parts
    math_parts = re.findall(r'∫.*?dx', text)
    
    for mp in math_parts:
        # Replace inline math with a block-style rendering
        formatted = f"\n{mp}\n"
        text = text.replace(mp, formatted)
    
    return text.strip()

category = int(input("""
1. Functions and graphs
2. Sequences and series
3. Vectors
4. Intro to complex numbers
5. Calculus
6. Probability and Stats
7. Random
                     
Enter the number of the topic you would like to practice: """))

cat = {1: "Functions_and_graphs", 2: "Sequences_and_series", 3: "Vectors", 4: "Intro_to_complex_numbers", 5: "Calculus", 6: "Probability_and_Stats", 7: "Random"}

questions_path = os.listdir(cat[category])

questions = []

for x in questions_path:
    with open(f"{cat[category]}/{x}", "r") as f:
        questions.append(f.read())

beginning = r"""
    %% LyX 2.3.6.1 created this file.  For more info, see http://www.lyx.org/.
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
questions = list(map(lambda x: beginning+x+end, questions))

others = []

question = LatexNodes2Text().latex_to_text(questions[0])
print(question)
question_embedding = model.encode(question)

print(len(questions))
questions.pop(0)
print(len(questions))

while len(questions)>0:
    print("length", len(questions))
    comparisons = []
    for i in questions:
        similarity = model.similarity(model.encode(i), question_embedding)
        comparisons.append([round(similarity.item(), 8), i])

    wrong = input("Enter W if you found this question to be difficult: ")

    if wrong.upper() == "W":
        question = max(comparisons)
        question = question[1]
        index = questions.index(question)
        question_embedding = model.encode(question)
        questions.pop(index)
        print(LatexNodes2Text().latex_to_text(question))
    else:
        question = min(comparisons)
        question = question[1]
        index = questions.index(question)
        question_embedding = model.encode(question)
        questions.pop(index)
        print(LatexNodes2Text().latex_to_text(question))