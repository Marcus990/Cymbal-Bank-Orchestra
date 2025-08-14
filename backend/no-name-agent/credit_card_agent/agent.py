from adk.agent import Agent
from adk.tools import tool

@tool
def recommend_credit_cards(user_id: str):
    """Recommends credit cards to the user based on their spending habits."""
    print(f"Recommending credit cards for user {user_id}")
    return {"status": "success", "recommendations": ["Credit Card A", "Credit Card B"]}

@tool
def check_for_redeemable_rewards(user_id: str):
    """Checks for redeemable rewards on the user's credit cards."""
    print(f"Checking for redeemable rewards for user {user_id}")
    return {"status": "success", "rewards": {"Credit Card A": "$10 cashback"}}

@tool
def check_for_hidden_charges(user_id: str):
    """Checks for hidden charges on the user's credit cards."""
    print(f"Checking for hidden charges for user {user_id}")
    return {"status": "success", "hidden_charges": []}

@tool
def get_spending_by_category(user_id: str, category: str):
    """Gets the user's spending by category."""
    print(f"Getting spending by category for user {user_id} in category {category}")
    return {"status": "success", "spending": 500.00}

# Define the agent
agent = Agent(
    name="CreditCardAgent",
    description="Helps users with their credit cards.",
    model="gemini-2.5-flash",
    tools=[
        recommend_credit_cards,
        check_for_redeemable_rewards,
        check_for_hidden_charges,
        get_spending_by_category,
    ],
)
