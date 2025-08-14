from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.planners import PlanReActPlanner
from google.adk.tools import get_transactions, get_spending_by_category
from subscription_agent.agent import agent as subscription_agent
from discount_agent.agent import agent as discount_agent
from duplicate_charge_detection_agent.agent import agent as duplicate_charge_detection_agent

daily_spendings_agent = Agent(
    llm=Gemini(model="gemini-2.5-flash"),
    planner=PlanReActPlanner(),
    agent_as_tool=[
        subscription_agent,
        discount_agent,
        duplicate_charge_detection_agent,
    ],
    tools=[
        get_transactions,
        get_spending_by_category,
    ],
    description="",
    instruction="",
    examples=[
        "I want to save an extra $100 this month. Where can I cut back?",
        "How am I tracking my 'dining out' budget for this month?",
    ],
)
