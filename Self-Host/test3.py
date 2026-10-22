from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1", # Use 8000 if using Option 2
    api_key="not-needed" 
)

response = client.embeddings.create(
    input="Self-hosting is awesome!",
    model="bge-small-en-v1.5"
)

print(response.data[0].embedding)