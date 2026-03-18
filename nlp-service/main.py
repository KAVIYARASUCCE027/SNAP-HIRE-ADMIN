from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import docx
import spacy
import re
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load English NLP Model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")
        
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    # Extract Text safely
    try:
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_location)
        else:
            text = extract_text_from_docx(file_location)
    except Exception as e:
        if os.path.exists(file_location): os.remove(file_location)
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    if os.path.exists(file_location):
        os.remove(file_location)

    # NLP Execution Pipeline
    doc = nlp(text)
    
    name = ""
    email = ""
    phone = ""
    education = ""
    experience = ""
    
    # Intelligent Spacy Name Resolution
    for ent in doc.ents:
        if ent.label_ == "PERSON" and not name:
            name = ent.text
    
    # Strict RegEx Email and Phone Matching
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if email_match:
        email = email_match.group(0)
        
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        phone = phone_match.group(0)

    # Pre-coded highly valued dictionary logic (since NLP NER models struggle with software acronyms)
    predefined_skills = [
        "python", "java", "c++", "javascript", "react", "node", "sql", "machine learning",
        "mongodb", "express", "aws", "docker", "fastapi", "html", "css", "git", "typescript",
        "kubernetes", "linux", "gcp", "azure", "jenkins", "postgres", "redis", "vue", "angular",
        "spring boot", "django", "flask"
    ]
    
    extracted_skills = []
    text_lower = text.lower()
    for skill in predefined_skills:
        skill_regex = r"\b" + re.escape(skill) + r"\b"
        if re.search(skill_regex, text_lower):
            extracted_skills.append(skill.upper())
            
    # Section block isolation
    edu_match = re.search(r'(?i)(?:education|academic)(.*?)(?:experience|skills|projects|certifications)', text, re.DOTALL)
    if edu_match:
        education = " ".join(edu_match.group(1).split())[:120] + "..."
        
    exp_match = re.search(r'(?i)(?:experience|work history)(.*?)(?:education|skills|projects|certifications)', text, re.DOTALL)
    if exp_match:
        experience = " ".join(exp_match.group(1).split())[:120] + "..."

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "experience": experience,
        "extractedSkills": extracted_skills
    }
