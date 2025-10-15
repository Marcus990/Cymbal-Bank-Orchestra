from google.adk.agents.remote_a2a_agent import RemoteA2aAgent

financial_agent = RemoteA2aAgent(
    name="financial_agent",
    description="Agent that has access to financial data. When asked for financial information general or user specific, use your tools to fetch the information",
    agent_card=(
        f"https://a2a-ep2-33wwy4ha3a-uw.a.run.app/.well-known/agent-card.json"
    ),
)
