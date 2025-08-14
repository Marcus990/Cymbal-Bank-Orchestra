from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.planners import PlanReActPlanner
from google.adk.agents.remote_a2a_agent import RemoteA2aAgent
import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import stripe

# Initialize Spotify API
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id="client_id", client_secret="client_secret"))

# Initialize Stripe API
stripe.api_key = "STRIPE_API_KEY"

def cancel_spotify_subscription(user_id: str):
    """Cancels the user's Spotify subscription if they haven't listened to much music recently."""
    # Get user's recently played tracks
    results = spotify.current_user_recently_played(limit=10)
    if len(results['items']) < 5:
        # Cancel subscription using Stripe
        try:
            # Assuming you have the customer ID and subscription ID stored somewhere
            customer_id = "cust001" # Replace with actual customer ID
            subscription_id = "sub_001" # Replace with actual subscription ID
            stripe.Subscription.delete(subscription_id)
            return {"status": "success", "message": "Spotify subscription cancelled."}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    else:
        return {"status": "success", "message": "User has been listening to music recently. Subscription not cancelled."}

def human_approval(question: str):
    """Asks for human approval before taking an action."""
    # In a real implementation, this would involve a notification to the user
    # and waiting for their response.
    print(f"Awaiting human approval for: {question}")
    return {"status": "success", "approved": True} # Simulating approval

subscriptions_agent = Agent(
    name="SubscriptionAgent",
    description="Manages user subscriptions.",
    instruction="""You are a subscription agent. Your goal is to help users manage their subscriptions.

    To identify subscriptions, you need to get the user's transactions. You can do this by calling the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_transactions",
        "user_id": "<user_id>",
        "start_date": "<start_date>",
        "end_date": "<end_date>"
    }
    ```

    From the transactions, look for recurring transactions with the same description and amount. These are likely subscriptions.

    If the user asks to cancel a subscription, you can use the `cancel_spotify_subscription` tool to cancel their Spotify subscription. For other subscriptions, you will need to ask for human approval before taking any action.""",
    sub_agents=[financial_agent],
    model="gemini-2.5-flash",
    tools=[
        cancel_spotify_subscription,
        human_approval,
    ],
)

discounts_agent = Agent(
    name="DiscountAgent",
    description="Finds relevant discounts and coupons for the user.",
    model="gemini-2.5-flash",
    sub_agents=[financial_agent],
    instruction="""You are a discount agent. Your goal is to help users find relevant discounts and coupons.

    To find discounts, you need to know the user's partners. You can get this information by calling the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_partners",
        "user_id": "<user_id>"
    }
    ```

    You can also get the user's transactions to identify potential savings. To do this, call the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_transactions",
        "user_id": "<user_id>",
        "start_date": "<start_date>",
        "end_date": "<end_date>"
    }
    ```
    """,
    tools=[
    ],
)

duplicate_charge_detection_agent = Agent(
    name="DuplicateChargeDetectionAgent",
    description="Detects potential duplicate charges and escalates to a support agent.",
    model="gemini-2.5-flash",
    sub_agents=[financial_agent],
    instruction="""You are a duplicate charge detection agent. Your goal is to detect potential duplicate charges and escalate them to a support agent.

    To detect duplicate charges, you need to get the user's transactions. You can do this by calling the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_transactions",
        "user_id": "<user_id>",
        "start_date": "<start_date>",
        "end_date": "<end_date>"
    }
    ```

    Look for transactions with the same merchant, amount, and date. If you find any, ask for human approval before taking any action.""",
    tools=[
        human_approval,
    ],
    # escalate_to="support_agent",
)


daily_spendings_agent = Agent(
    name="daily_spendings_agent",
    model="gemini-2.5-flash",
    planner=PlanReActPlanner(),
    agent_as_tool=[
        subscriptions_agent,
        discounts_agent,
        duplicate_charge_detection_agent,
    ],
    sub_agents=[financial_agent],
    description="I am a daily spending agent. I can help you manage your daily spending, identify subscriptions, find discounts, and detect duplicate charges.",
    instruction="""You are a daily spending agent. Your goal is to help users manage their daily spending. You have access to the following sub-agents:

    *   `SubscriptionAgent`: Manages user subscriptions.
    *   `DiscountAgent`: Finds relevant discounts and coupons for the user.
    *   `DuplicateChargeDetectionAgent`: Detects potential duplicate charges and escalates to a support agent.

    You can also interact with the `financial_agent` to get financial data.

    To get the user's transactions, you can call the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_transactions",
        "user_id": "<user_id>",
        "start_date": "<start_date>",
        "end_date": "<end_date>"
    }
    ```

    To get the user's partners, you can call the `financial_agent` with the following input:

    ```json
    {
        "tool_name": "get_partners",
        "user_id": "<user_id>"
    }
    ```
    """,
)
