from google.adk.agents import Agent

# Define the agent
agent = Agent(
    name="InvestmentsAgent",
    description="For helpping users with investments",
    model="gemini-2.5-flash",
    tools=[
    ],
)
