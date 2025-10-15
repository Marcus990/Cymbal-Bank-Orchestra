from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from financial_agent.agent import financial_agent
from google.adk.agents.llm_agent import LlmAgent

financial_agent_tool = AgentTool(agent=financial_agent)

agent = LlmAgent(
    name="TransactionHistoryAgent",
    description="For helping users get their transaction history",
    model="gemini-2.0-flash-live-001",
    instruction="""You are a transaction history agent. When asked for transaction history:

🎯 MISSION: Get user-specific transaction data from the financial_agent and return it accurately.

1. Use the financial_agent tool to query for user transaction history
2. The user ID will be provided in the request - use that specific user ID
3. IMPORTANT: When querying the financial_agent, explicitly ask for transaction data for the specific user ID
4. Return the data in this exact JSON format:

[
  {
    "Transaction ID": "txn_id_011",
    "Account ID": "acc-jd-c-001", 
    "Amount": "$4000",
    "Category": "Income",
    "Date": "2025-08-25",
    "Description": "Paycheck"
  }
]

🎯 CRITICAL REQUIREMENTS: 
- ALWAYS specify the user ID when querying the financial_agent
- Example: "Get transaction history for user [USER_ID]" or "Show me transactions for user [USER_ID]"
- Return whatever data the financial_agent provides for that specific user
- Ensure the data is actually user-specific, not generic/hardcoded data
- The response must contain real transaction data for the requested user""",
    tools=[financial_agent_tool],
)
