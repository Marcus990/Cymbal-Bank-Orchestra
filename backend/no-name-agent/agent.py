from google.adk.tools.google_search_tool import google_search
from google.adk.agents.llm_agent import LlmAgent
from google.adk.agents.remote_a2a_agent import RemoteA2aAgent

from google.adk.a2a.utils.agent_to_a2a import to_a2a
from google.genai import types
import uvicorn
# from daily_spendings_agent import daily_spendings_agent

from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.planners import PlanReActPlanner
# from google.adk.tools import get_transactions, get_spending_by_category
from subscription_agent.agent import agent as subscription_agent
from discount_agent.agent import agent as discount_agent
from duplicate_charge_detection_agent.agent import agent as duplicate_charge_detection_agent
from daily_spendings_agent.agent import daily_spendings_agent
from investments_agent.agent import agent as investments_agent
from google.adk.tools.agent_tool import AgentTool
from financial_agent.agent import financial_agent

daily_spendings_agent_tool = AgentTool(agent=daily_spendings_agent)

financial_agent_tool = AgentTool(agent=financial_agent)




root_agent = LlmAgent(
    model="gemini-2.0-flash-live-001",
    name="router_agent",
    description="You are a financial services agent that has access to remote financial agent that can access the Bank API. You also have access """,
    global_instruction=(
                "You are assistant Bot, an assistant agent."
    ),
    # speech_to_text=types.SpeechToTextConfig(
    #     end_of_speech_detection=True
    # ),
    instruction="""
            You are a helpful assistant that helps users with their requets.
            If there are questions of financial nature, you can work with the financial_agent who can answer questions of financial topics. You can also work with
            and redirect the user's request to your sub-agents that you think will answer their request best.
        """,
    # sub_agents=[financial_agent],
    tools=[financial_agent_tool, daily_spendings_agent_tool],
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