from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.planners import PlanReActPlanner
# from google.adk.tools import get_transactions, get_spending_by_category
from subscription_agent.agent import agent as subscription_agent
from discount_agent.agent import agent as discount_agent
from duplicate_charge_detection_agent.agent import agent as duplicate_charge_detection_agent
from financial_agent.agent import financial_agent
from google.adk.tools.agent_tool import AgentTool

financial_agent_tool = AgentTool(agent=financial_agent)

daily_spendings_agent = Agent(
    name="daily_spendings_agent",
    model="gemini-2.5-flash",
    planner=PlanReActPlanner(),
    sub_agents=[
        subscription_agent,
        discount_agent,
        duplicate_charge_detection_agent,
    ],
    tools=[
        financial_agent_tool,
    ],
    description="",
    instruction="",
)