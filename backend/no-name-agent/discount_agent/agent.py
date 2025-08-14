from google.adk.agents import Agent
# from google.adk.tools import tool

def proactively_identify_discounts(user_id: str):
    """
    Get users transactions for the last month or last 3 months. Identify the category, cross check with partners and see if they could have saved money by 
    using promotions or discounts. Flag it to the user.
    """
    print(f"Proactively identifying discounts for user {user_id}")
    return {"status": "success", "potential_savings": "If you had instead purchased groceries from No Frills, you would have saved X amount of money by using this Y discount"}

def find_relevant_discounts(user_id: str, query: str):
    """
    Fetch partners for the user using the endpoint GET /api/partners/user/{user_id} and find discounts for the user query.
    Stretch goal:
    Get location from the user. Use Google Maps to find nearby locations for that category. Pass the website URL to gemini to identify ongoing offers if any.
    """
    print(f"Finding relevant discounts for user {user_id} with query: {query}")
    return {"status": "success", "discounts": ["10% off at Supermarket A", "20% off at Supermarket B"]}


# Define the agent
agent = Agent(
    name="DiscountAgent",
    description="Finds relevant discounts and coupons for the user.",
    model="gemini-2.5-flash",
    tools=[
        proactively_identify_discounts,
        find_relevant_discounts,
    ],
    # examples=[
    #     "I'm going to the supermarket. Are there any relevant coupons or discounts?",
    # ]
)
