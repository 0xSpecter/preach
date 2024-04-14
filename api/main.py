import pprint as pp
import uvicorn
import fastapi
from fastapi.middleware.cors import CORSMiddleware
import gensim.downloader as gd
from pydantic import BaseModel

model = gd.load('glove-wiki-gigaword-50')

def run(operations : list[dict]):
    vector = None
    
    for op in operations:
        match op["operation"]:
            case "+":
                vector = vector + model[op["word"]]
            
            case "-":
                vector = vector - model[op["word"]]
                
            case "*":
                vector = vector * model[op["word"]]
                
            case "/":
                vector = vector / model[op["word"]]
            
            case "None":
                vector = model[op["word"]]
            
            case _:
                return "Invalid operation"
    
    return model.similar_by_vector(vector)

def validate(operations : list[dict]) -> str | None:
    for op in operations:
        try:
            model[op["word"]]
            
        except KeyError:
            return op["word"]
    
    return None

operations = [
    {
        "operation": "None",
        "word": "dog",
    },
    {
        "operation": "add",
        "word": "hitler",
    },
]

#pp.pprint(run(operations))

app = fastapi.FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

class Operation(BaseModel):
    operation: str
    word: str
    
class Operations(BaseModel):
    operations: list[Operation]

@app.get("/")
def read_root():
    return "Api is running"


@app.post("/validate")
def validate_req(body: Operations):
    validation = validate(body.model_dump()["operations"])
    
    return True if validation is None else validation

@app.post("/run")
def process(body: Operations):
    return run(body.model_dump()["operations"])

if __name__ == "__main__":
    uvicorn.run(app, port=8000)