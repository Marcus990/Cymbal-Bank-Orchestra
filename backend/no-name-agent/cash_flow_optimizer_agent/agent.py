from google.adk.agents import Agent
from google.adk.planners import PlanReActPlanner
from google.adk.tools import tool

@tool
def transfer_to_account(user_id: str, from_account: str, to_account: str, amount: float):
    """Transfers money from one account to another."""
    print(f"Transferring {amount} from {from_account} to {to_account} for user {user_id}")
    return {"status": "success", "message": "Transfer successful."}

@tool
def schedule_transfers(user_id: str, from_account: str, to_account: str, amount: float, date: str):
    """Schedules a transfer for a future date."""
    print(f"Scheduling transfer of {amount} from {from_account} to {to_account} for user {user_id} on {date}")
    return {"status": "success", "message": "Transfer scheduled successfully."}

@tool
def get_transactions(user_id: str):
    """Gets the user's transactions."""
    print(f"Getting transactions for user {user_id}")
    return {"status": "success", "transactions": []}

# Define the agent
agent = Agent(
    name="CashFlowOptimizerAgent",
    description="Optimizes the user's cash flow by automatically transferring money.",
    model="gemini-2.5-flash",
    planner=PlanReActPlanner(),
    tools=[
        transfer_to_account,
        schedule_transfers,
        get_transactions,
    ],
)
