# Cymbal Bank Orchestra

Official Episode: https://youtu.be/0CQxF56MKWo?si=tePVNHQAXcv9RAvZ

As a user of Cymbal Bank's financial services platform, you should have full control of your money. You should have full confidence in our platform's reliability while still having a great user experience with ease-of-use. 

We present the Cymbal Bank Orchestra Platform, an intelligent financial services platform built with Google's Agent Development Kit (ADK), A2A Protocol, and Gemini models. This multi-agent system provides comprehensive banking assistance through specialized AI agents for daily spending, investments, financial planning, and more. The user has full control over the agents (instruments) that interact with their bank account as the composer of their orchestra.

## 🎯 Overview

This project is a demonstration of agentic AI architecture for financial services, featuring:

- **Multi-Agent Architecture**: Specialized AI agents working together to handle complex financial tasks
- **Real-time Communication**: WebSocket-based streaming interface with text and audio support
- **Comprehensive Banking Features**: Account management, transaction tracking, goal setting, calendar scheduling, and financial insights
- **Modern UI**: React-based frontend with real-time updates and interactive visualizations

## Excalidraw Link
https://excalidraw.com/#room=9c8106e276ad8dc6ae97,zFeWLgE09u4YL8MWHNox7A

## 🏗️ Architecture

### Backend (`backend/no-name-agent/`)

The backend is built with Python and FastAPI, featuring a hierarchical agent system:

#### Core Agents

- **Root Agent**: Main orchestrator that routes requests to specialized sub-agents
- **Financial Agent**: Handles core banking operations (accounts, transactions, goals, schedules)
- **Daily Spendings Agent**: Manages subscriptions, discounts, and duplicate charge detection
- **Big Spendings Agent**: Analyzes affordability for large purchases and mortgage eligibility
- **Investments Agent**: Provides market data, investment concepts, and financial news
- **Calendar Agent**: Manages appointments with bank advisors
- **Transaction History Agent**: Specialized agent for retrieving user transaction data
- **Proactive Insights Agent**: Generates personalized financial insights and recommendations

### Frontend (`frontend/`)

Modern React application built with TypeScript and Vite:

- **Real-time Chat Interface**: WebSocket-based communication with streaming responses
- **Audio Support**: Speech-to-text and text-to-speech capabilities
- **Interactive Visualizations**: Transaction history charts and financial insights
- **Permission System**: User-controlled data access and agent capabilities
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 16+**
- **Google Cloud Account** with Gemini API access
- **Google Calendar API credentials** (optional, for calendar features)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/no-name-agent
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file with your API keys
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

4. (Optional) Set up Google Calendar authentication:
   ```bash
   python setup_calendar_auth.py
   ```

5. Start the backend server:
   ```bash
   ./start.sh
   ```

   The backend will be available at `http://localhost:8001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ./start.sh
   # or
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📚 Documentation

Additional documentation can be found in the `frontend/docs/` directory:

- **DEMO_INTEGRATION.md**: Integration guide for demo features
- **JSON_TABLE_INTEGRATION.md**: Guide for displaying data in table format
- **PERMISSIONS_INTEGRATION.md**: Permission system implementation
- **SPEECH_TO_TEXT_README.md**: Audio features documentation

## 🛠️ Technology Stack

### Backend
- **Google ADK (Agent Development Kit)**: Agent framework
- **Gemini 2.0 Flash & 2.5 Flash**: LLM models
- **FastAPI**: Web framework
- **WebSockets**: Real-time communication
- **Python 3.9+**: Core language

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **WebSocket API**: Real-time agent communication
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling

## 🎨 Key Features

### For Users
- Natural language banking interactions
- Voice-enabled assistance
- Real-time transaction tracking
- Financial goal management
- Investment information and market data
- Appointment scheduling with advisors
- Subscription management
- Duplicate charge detection
- Personalized financial insights

### For Developers
- Modular agent architecture
- Easy agent composition and delegation
- WebSocket streaming protocol
- Comprehensive API endpoints
- Type-safe frontend with TypeScript
- Hot module reloading for development

## 🔒 Security & Privacy

- Environment-based API key management
- CORS configuration for production
- User-specific data isolation
- Permission-based feature access

## 📦 Project Structure

```
.
├── backend/
│   └── no-name-agent/           # Backend application
│       ├── agent.py             # Root agent definition
│       ├── main.py              # FastAPI application
│       ├── financial_agent/     # Financial operations agent
│       ├── daily_spendings_agent.py
│       ├── big_spendings_agent.py
│       ├── investments_agent/
│       ├── calendar_agent.py
│       └── ...                  # Other specialized agents
├── frontend/
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── lib/                     # Utilities and services
│   ├── contexts/                # React contexts
│   ├── docs/                    # Documentation
│   └── ...
└── README.md                    # This file
```

## 🤝 Contributing

This project was developed for the second episode of the Google Cloud AI Agent Bake-Off.

**Team**: Marcus + Sita

## 🙏 Acknowledgments

- Google Cloud AI and the ADK team
- Gemini API for powering the AI agents
- The Google Cloud AI Agent Bake-Off organizers
