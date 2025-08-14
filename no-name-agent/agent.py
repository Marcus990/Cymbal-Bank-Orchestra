import requests
from datetime import datetime, timedelta
from google.adk.agents import LlmAgent
from a2a.types import AgentCard, AgentCapabilities, AgentSkill
from adk.planner import PlanReActPlanner
from adk.tools import tool

# Assuming the existence of an A2A client for Cymbal Bank Agent
# from cymbal_bank_client import cymbal_bank_agent

@tool
def get_transactions(user_id: str, start_date: str = None, end_date: str = None):
    """
    This tool will use the A2A protocol to ask the Cymbal Bank Agent to use its get_transactions skill
    (which calls GET /users/{user_id}/transactions).
    """
    params = {}
    if start_date:
        params["start_date"] = start_date
    if end_date:
        params["end_date"] = end_date
    response = requests.get(f"https://backend.ai-agent-bakeoff.com/users/{user_id}/transactions", params=params)
    response.raise_for_status()
    return response.json()

@tool
def get_spending_by_category(user_id: str, category: str, time_period: str = "this month"):
    """
    Your agent's code will then filter these transactions
    by the specified category and time_period and sum the amounts.
    """
    today = datetime.today()
    if time_period == "this month":
        start_date = today.replace(day=1)
        end_date = today
    elif time_period == "last month":
        first_day_of_current_month = today.replace(day=1)
        last_day_of_last_month = first_day_of_current_month - timedelta(days=1)
        start_date = last_day_of_last_month.replace(day=1)
        end_date = last_day_of_last_month
    else:
        # default to this month
        start_date = today.replace(day=1)
        end_date = today

    transactions = get_transactions(user_id=user_id, start_date=start_date.strftime('%Y-%m-%d'), end_date=end_date.strftime('%Y-%m-%d'))
    filtered_transactions = [t for t in transactions if t.get('category') == category]
    total_spending = sum(t.get('amount', 0) for t in filtered_transactions)
    return total_spending

class FinancialCopilotAgent(LlmAgent):
    def __init__(self, **kwargs):
        super().__init__(
            model="gemini-1.5-flash",
            tools=[
                get_transactions,
                get_spending_by_category,
            ],
            **kwargs,
        )

    def create_agent_card(self, agent_url: str) -> "AgentCard":
        return AgentCard(
            name="FinancialCopilot",
            description="I am a financial copilot that can help you manage your finances.",
            url=agent_url,
            version="1.0.0",
            defaultInputModes=["application/json", "text/plain"],
            defaultOutputModes=["application/json", "text/plain"],
            capabilities=AgentCapabilities(streaming=True),
            skills=[
                AgentSkill(
                    id="financial_copilot",
                    name="Financial Copilot",
                    description="A financial copilot that can help you manage your finances.",
                    tags=["finance", "copilot"],
                    examples=[
                        "I want to save an extra $100 this month. Where can I cut back?",
                        "How am I tracking my 'dining out' budget for this month?",
                    ]
                )
            ]
        )