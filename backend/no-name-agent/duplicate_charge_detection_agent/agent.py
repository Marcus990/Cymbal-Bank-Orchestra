from google.adk.agents import Agent
from google.adk.tools import tool

@tool
def get_transactions(user_id: str):
    """Gets the user's transactions."""
    print(f"Getting transactions for user {user_id}")
    # In a real implementation, this would fetch transactions from a database or API.
    return {"status": "success", "transactions": [
        {"transaction_id": "123", "merchant": "Merchant A", "amount": 10.00, "date": "2025-08-14T10:00:00Z"},
        {"transaction_id": "124", "merchant": "Merchant A", "amount": 10.00, "date": "2025-08-14T10:05:00Z"},
        {"transaction_id": "125", "merchant": "Merchant B", "amount": 25.50, "date": "2025-08-14T11:00:00Z"},
    ]}

@tool
def get_credit_card_charges(user_id: str):
    """Gets the user's credit card charges. [TBD]"""
    print(f"Getting credit card charges for user {user_id}")
    return {"status": "success", "charges": []}

@tool
def human_approval(question: str):
    """Asks for human approval before taking an action."""
    print(f"Awaiting human approval for: {question}")
    return {"status": "success", "approved": True}

# Define the agent
agent = Agent(
    name="DuplicateChargeDetectionAgent",
    description="Detects potential duplicate charges and escalates to a support agent.",
    model="gemini-2.5-flash",
    tools=[
        get_transactions,
        get_credit_card_charges,
        human_approval,
    ],
    escalate_to="support_agent",
)
