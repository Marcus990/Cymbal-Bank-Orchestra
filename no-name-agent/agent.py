from google.adk.tools.google_search_tool import google_search
from google.adk.agents.llm_agent import LlmAgent
from google.adk.agents.remote_a2a_agent import RemoteA2aAgent

from google.adk.a2a.utils.agent_to_a2a import to_a2a
from google.genai import types
import uvicorn

financial_agent = RemoteA2aAgent(
    name="financial_agent",
    description="Agent that has access to financial data. When asked for financial information general or user specific, use your tools to fetch the information",
    agent_card=(
        f"https://a2a-ep2-33wwy4ha3a-uw.a.run.app/.well-known/agent-card.json"
    ),
)


root_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="router_agent",
    description="You are a financial services agent that has access to remote financial agent that can access the Bank API. You also have access """,
    global_instruction=(
                "You are assistant Bot, an assistant agent."
    ),
    instruction="""
            You are a helpful assistant that helps users with their requets.
            If there are questinos of financial nature, you can work with the financial_agent who can answer questions of financial topics.
        """,
    sub_agents=[financial_agent],
    generate_content_config=types.GenerateContentConfig(
                safety_settings=[
                    types.SafetySetting( 
                        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold=types.HarmBlockThreshold.OFF,
                    ),
                ]
            ),
)



# # # Make your agent A2A-compatible
a2a_app = to_a2a(root_agent, port=8001)

# uvicorn.run(a2a_app, host='0.0.0.0', port=9998)