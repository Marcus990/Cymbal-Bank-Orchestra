from google.adk.agents import Agent
from google.adk.tools import tool

@tool
def send_email(to: str, subject: str, body: str):
    """Sends an email."""
    print(f'Sending email to {to} with subject "{subject}" and body "{body}')
    return {"status": "success", "message": "Email sent successfully."}

# Define the agent
agent = Agent(
    name="SupportAgent",
    description="Provides support to users.",
    model="gemini-2.5-flash",
    tools=[
        send_email,
    ],
)
