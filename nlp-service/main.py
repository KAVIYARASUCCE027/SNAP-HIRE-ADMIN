from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import spacy
import pdfplumber
import docx
import re
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Spacy model not found. Ensure it is downloaded.")

PREDEFINED_SKILLS = [
    "python", "java", "c++", "javascript", "react", "node", "node.js", "sql", "nosql",
    "aws", "docker", "kubernetes", "machine learning", "fastapi", "django",
    "flask", "html", "css", "typescript", "git", "linux", "mongodb", "express"
]

def extract_text_from_pdf(file_bytes):
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text
    except Exception as e:
        raise ValueError(f"Failed to read PDF file: {str(e)}")

def extract_text_from_docx(file_bytes):
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        raise ValueError(f"Failed to read DOCX file: {str(e)}")

def parse_resume_text(text: str):
    doc = nlp(text)
    
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0) if email_match else ""

    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""

    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text.strip()
            if len(name.split()) >= 2:
                break
    
    text_lower = text.lower()
    skills_found = [skill for skill in PREDEFINED_SKILLS if skill in text_lower]

    education = ""
    experience = ""
    
    lines = text.split('\n')
    current_section = None
    edu_lines = []
    exp_lines = []
    
    for line in lines:
        line_clean = line.strip().lower()
        if line_clean in ["education", "academic background", "education & certifications"]:
            current_section = "education"
            continue
        elif line_clean in ["experience", "work experience", "professional experience", "employment history"]:
            current_section = "experience"
            continue
        elif line_clean in ["skills", "projects", "certifications", "summary"]:
            current_section = None 
            
        if current_section == "education" and line.strip():
            edu_lines.append(line.strip())
        elif current_section == "experience" and line.strip():
            exp_lines.append(line.strip())

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(set(skills_found)),
        "education": "\n".join(edu_lines[:15]),
        "experience": "\n".join(exp_lines[:20])
    }

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    filename = file.filename.lower()
    if not (filename.endswith('.pdf') or filename.endswith('.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_bytes = await file.read()
    
    try:
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_bytes)
        else:
            text = extract_text_from_docx(file_bytes)
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Document appears to be empty or image-based")
            
        parsed_data = parse_resume_text(text)
        return parsed_data
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Server error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during processing")
