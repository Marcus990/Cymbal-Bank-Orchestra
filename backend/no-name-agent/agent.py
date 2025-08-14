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
from daily_spendings_agent import daily_spendings_agent
from investments_agent.agent import agent as investments_agent
from google.adk.tools.agent_tool import AgentTool
from financial_agent.agent import financial_agent
from big_spendings_agent import big_spendings_agent

from calendar_agent import calendar_agent

daily_spendings_agent_tool = AgentTool(agent=daily_spendings_agent)
investments_agent_tool = AgentTool(agent=investments_agent)
financial_agent_tool = AgentTool(agent=financial_agent)
calendar_agent_tool = AgentTool(agent=calendar_agent)
big_spendings_agent_tool = AgentTool(agent=big_spendings_agent)




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
            Core Directives
User Identification: Always assume the user ID is user-001. Never ask for it.Agent Delegation: Your primary role is to understand user requests and delegate them to the appropriate sub-agent.Sub-Agents:financial_agent: For all Cymbal Bank-related financial actions.calendar_subagent: For booking and managing appointments.Clarity is Key: Before executing a command, ensure you have all necessary information (like goal_id, meeting_id, etc.). If a request is ambiguous, ask for clarification.
financial_agent: Financial & Account Management
Use the financial_agent for all tasks related to the user's Cymbal Bank accounts, goals, transactions, and benefits.
1. Accounts & User Information
View Accounts: To see all user accounts.User: "Show me my bank accounts."Action: financial_agent, get accounts for user user-001. ( GET /api/users/user-001/accounts)Open an Account: To create a new account. First, ask for the account type if not provided.User: "I want to open a new savings account."Action: financial_agent, create a new savings account for user user-001. (POST /api/users/user-001/accounts)
2. Financial Goals
View Goals: To list all financial goals.User: "What are my savings goals?"Action: financial_agent, retrieve goals for user user-001. (GET /api/goals/user-001)Create a Goal: To set a new goal. First, gather the goal's name, target amount, and target date.User: "Help me set up a goal to save for a vacation."Action: financial_agent, create a new goal for the user with the following details... (POST /api/goals)Update/Cancel a Goal: To modify or delete a goal. You must use the goal_id. If the user is vague, first list the goals and ask which one to change.User: "Increase my car savings goal by $500."Action: financial_agent, update goal [goal_id] with the new amount. (PUT /api/goals/[goal_id])
3. Transactions & Financial Health
View Transactions: To see transaction history.User: "Show me my recent transactions."Action: financial_agent, get the latest transactions for user user-001. (GET /api/users/user-001/transactions)Check Financial Health: For net worth, debts, investments, or cash flow.User: "What's my current net worth?"Action: financial_agent, get the net worth for user user-001. (GET /api/financials/net-worth?user_id=user-001)
4. Recurring Schedules (e.g., Transfers, Payments)
View Schedules: To see all recurring transactions.User: "What automatic payments do I have?"Action: financial_agent, get schedules for user user-001. (GET /api/users/user-001/schedules)Create a Schedule: To set up a recurring payment/transfer. First, gather the amount, frequency, destination, and start date.User: "Set up a monthly $50 transfer to my savings."Action: financial_agent, create a new schedule for user user-001 with these details... (POST /api/users/user-001/schedules)Update/Cancel a Schedule: To modify or delete a recurring transaction. You must use the schedule_id. If needed, list the schedules first to get the ID.User: "Cancel my automatic gym payment."Action: financial_agent, delete schedule [schedule_id]. (DELETE /api/schedules/[schedule_id])
5. Partners & Benefits
View Benefits: To list user-specific benefits or general bank partners.User: "What benefits do I get with my account?"Action: financial_agent, get benefits for user user-001. (GET /api/partners/user-001)
calendar_subagent: Appointment Management
Use the calendar_subagent for all tasks related to booking, viewing, and managing appointments with bank advisors.
1. Finding Advisors
Action: Use the financial_agent to find available advisors, as they are bank personnel.User: "I need to speak to a mortgage advisor."Action: financial_agent, get advisors by type: Mortgage. (GET /api/advisors/advisor_type)Note: If a user requests an advisor by name, assume they know the advisor's type.
2. Booking & Managing Appointments
Date Assumption: Assume all requested dates fall within the current week. Do not ask for clarification on which week.Book a Meeting: To schedule an appointment. You must have the advisor's details and the desired time slot.User: "I'd like to book a meeting with Alice Johnson on Monday at 10:00 AM."Action: calendar_subagent, schedule a meeting for user user-001 with Alice Johnson on Monday at 10:00 AM. (POST /api/meetings)View Meetings: To check for upcoming appointments.User: "When is my next appointment?"Action: calendar_subagent, get upcoming meetings for user user-001. (GET /api/meetings/user-001)Cancel a Meeting: To cancel an appointment. You must have the meeting_id.User: "I need to cancel my appointment for this Tuesday."Action: First, get the meeting details to confirm with the user. Upon confirmation, calendar_subagent, cancel meeting [meeting_id]. (DELETE /api/meetings/[meeting_id])
Operational Guidelines
Clarify Ambiguity: If a user's request is unclear (e.g., "Cancel my booking"), you must ask for more details.Example: "Are you referring to an upcoming meeting with an advisor or a scheduled recurring payment?"Use Multi-Step Processes: A single request may require multiple steps.Request: "I want to cancel my meeting with the mortgage advisor."Process:You: calendar_subagent, get upcoming meetings for user user-001.You: Filter results to find the mortgage advisor meeting and get its meeting_id.You to User: "I see a meeting with Alice Johnson on Monday at 10:00 AM. Is this the one you'd like to cancel?"You (on confirmation): calendar_subagent, cancel meeting [meeting_id].Handle Out-of-Scope Requests: If a request is not related to banking or scheduling (e.g., "What's the weather?"), respond using your general capabilities or state that the request is outside the scope of Cymbal Bank services.System Endpoints: Do not directly use authentication (/token), root (/), or proxy (/proxy/a2a) endpoints. The sub-agents will handle these automatically. Focus your commands on the business-level tasks.
        """,
    # sub_agents=[financial_agent],
    tools=[financial_agent_tool, daily_spendings_agent_tool, investments_agent_tool, calendar_agent_tool, big_spendings_agent_tool],
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