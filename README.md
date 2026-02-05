Starter Task: Project #11: Resolving Ambiguity in Visual Question Answering for Accessibility
Project Contact: Rosiana Natalie (rosianan@umich.edu)
Objective
This starter project focuses on designing, building, and evaluating a human-centered Visual Question Answering (VQA) system that helps blind and low-vision users resolve ambiguity in visual content. Ambiguous questions (e.g., “What is on the table?”) are common in everyday use and can lead to incomplete, confusing, or misleading answers from current VQA tools.
Your goal is to prototype an interactive AI system and interface that:
Makes ambiguity explicit (e.g., when multiple plausible objects/regions match a question), and
Empowers users to clarify their intent through an accessible interaction flow.
The project will explore two interaction styles inspired by human-assisted VQA:
Respond in One Pass: the system provides a comprehensive answer that covers all plausible interpretations.
Clarify Iteratively: the system engages in a brief, turn-by-turn clarification dialogue to narrow down the user’s intent and provide targeted detail.
You will also propose (and ideally pilot) a small study to evaluate whether the system helps users resolve ambiguity effectively.
Task Requirements
1) Build a Prototype Application (Mobile or Web): Develop a mobile app or web app that supports the following:
Inputs: 
An image containing multiple objects
A user question about the image (text input)
Output: 
Ambiguity-Aware Image Description that includes:
What objects are present
How many instances of each object appear (when possible)
Where objects are located (e.g., left/right/top/bottom; relative positioning)
Salient attributes, such as color, shape, visible text, material, or other distinguishing details
Bonus (recommended): 
Input: A video stream or short recorded video, when feasible, to explore ambiguity that unfolds across time
Output: The output should explicitly acknowledge ambiguity and organize information to help the user disambiguate. For example, if several objects are on a table, the response should communicate that multiple items are present and provide detailed, grouped descriptions (e.g., “five books…” followed by book-specific details).
2) Support Two Interaction Modes in the Application
Your application must allow users to choose between two interaction styles (See Figure 1 for illustration):
Respond in One Pass:
The system provides a single, detailed response that describes all relevant entities.
The response should be structured and easy to follow (e.g., by grouping objects or arranging them spatially).
Clarify Iteratively:
The system begins with a brief response that surfaces ambiguity (e.g., “I see several objects: a bottle, books, and a cable. Which one do you mean?”)
The user can ask follow-up questions and the system progressively provides more specific information until the user is satisfied.

Figure 1. In Respond in One Pass, the user receives a complete description that covers ambiguity in a single response. In Clarify Iteratively, the user and system engage in a multi-turn dialogue to resolve ambiguity through successive clarification.
3) Propose a User Study: 

Write a short study plan that evaluates how well the system helps users resolve ambiguity. Your proposal should include:
Study method (e.g., within-subject or between-subject design comparison of one-pass vs. iterative)
Metrics (e.g., task success rate, time to resolve ambiguity, perceived usefulness, trust, workload)
Number of participants (reasonable for a pilot; justify your choice)
Bonus: Conduct a small pilot with several participants. Ideally, include blind or low-vision participants; if not possible, explain your recruitment constraints and what you did instead.
4) Accessibility Expectations (Bonus but highly recommended):
Because this project is intended for blind and low-vision users, your prototype should demonstrate attention to accessibility, for example:
Screen-reader-friendly UI elements and labeling
Keyboard navigation (for web) or VoiceOver/TalkBack compatibility (for mobile)
Deliverables (Due in 10 Days)
Code repository (GitHub)
Include a clear README with setup instructions.
Demo video (2-4 minutes)
Show both interaction modes end-to-end on at least one example image and question.
Short report (~2 pages, PDF)
System architecture: major components and data flow
Design rationale: why you designed the interaction the way you did
Related work references: a few relevant citations (papers/tools)
Future directions: what you would improve next and why
