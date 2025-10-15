
import os
import json
import asyncio
import base64
import warnings

from pathlib import Path
from dotenv import load_dotenv

from google.genai.types import (
    Part,
    Content,
    Blob,
)

from google.adk.runners import InMemoryRunner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.genai import types

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from agent import root_agent
from investments_agent.agent import agent as investments_agent
from daily_spendings_agent import daily_spendings_agent
from financial_agent.agent import financial_agent
from transaction_history_agent.agent import agent as transaction_history_agent
# from proactive_insights_agent.agent import proactive_insights_agent

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

load_dotenv()

APP_NAME = "ADK Streaming example"


async def start_agent_session(user_id, is_audio=False, agent_id=None):
    """Starts an agent session"""

    # Create a Runner
    agent_map = {
        "investments_agent": investments_agent,
        "daily_spendings_agent": daily_spendings_agent,
        "financial_agent": financial_agent,
        "transaction_history_agent": transaction_history_agent,
        # "proactive_insights_agent": proactive_insights_agent
    }

    runner = InMemoryRunner(
        app_name=APP_NAME,
        agent=agent_map.get(agent_id, root_agent),
    )

    # Create a Session
    session = await runner.session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,  # Replace with actual user ID
    )

    # Set response modality
    modality = "AUDIO" if is_audio else "TEXT"
    run_config = RunConfig(
        response_modalities=[modality]
        # Removed session_resumption as it's not supported by Gemini API
    )

    # Create a LiveRequestQueue for this session
    live_request_queue = LiveRequestQueue()

    # Start agent session
    live_events = runner.run_live(
        session=session,
        live_request_queue=live_request_queue,
        run_config=run_config,
    )
    return live_events, live_request_queue


async def agent_to_client_messaging(websocket, live_events):
    """Agent to client communication"""
    async for event in live_events:

        # If the turn complete or interrupted, send it
        if event.turn_complete or event.interrupted:
            message = {
                "turn_complete": event.turn_complete,
                "interrupted": event.interrupted,
            }
            await websocket.send_text(json.dumps(message))
            print(f"[AGENT TO CLIENT]: {message}")
            continue

        # Read the Content and its first Part
        part: Part = (
            event.content and event.content.parts and event.content.parts[0]
        )
        if not part:
            continue

        # If it's a transcript, send it
        is_transcript = part.text and not event.partial
        if is_transcript:
            message = {
                "mime_type": "application/json",
                "data": json.dumps({"transcript": part.text})
            }
            await websocket.send_text(json.dumps(message))
            print(f"[AGENT TO CLIENT]: transcript: {part.text}")
            continue

        # If it's audio, send Base64 encoded audio data
        is_audio = part.inline_data and part.inline_data.mime_type.startswith("audio/pcm")
        if is_audio:
            audio_data = part.inline_data and part.inline_data.data
            if audio_data:
                message = {
                    "mime_type": "audio/pcm",
                    "data": base64.b64encode(audio_data).decode("ascii")
                }
                await websocket.send_text(json.dumps(message))
                print(f"[AGENT TO CLIENT]: audio/pcm: {len(audio_data)} bytes.")
                continue

        # If it's text and a parial text, send it
        if part.text and event.partial:
            message = {
                "mime_type": "text/plain",
                "data": part.text
            }
            await websocket.send_text(json.dumps(message))
            print(f"[AGENT TO CLIENT]: text/plain: {message}")


async def client_to_agent_messaging(websocket, live_request_queue):
    """Client to agent communication"""
    while True:
        # Decode JSON message
        message_json = await websocket.receive_text()
        message = json.loads(message_json)
        mime_type = message["mime_type"]
        data = message["data"]

        # Send the message to the agent
        if mime_type == "text/plain":
            # Send a text message
            content = Content(role="user", parts=[Part.from_text(text=data)])
            live_request_queue.send_content(content=content)
            print(f"[CLIENT TO AGENT]: {data}")
        elif mime_type == "audio/pcm":
            # Send an audio data
            decoded_data = base64.b64decode(data)
            live_request_queue.send_realtime(Blob(data=decoded_data, mime_type=mime_type))
        else:
            raise ValueError(f"Mime type not supported: {mime_type}")


#
# FastAPI web app
#

app = FastAPI()

# Allow local frontend origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
        "*",  # relax during development; tighten for production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = Path(__file__).resolve().parent


@app.get("/")
async def root():
    return JSONResponse({"status": "ok", "message": "Backend running"})


@app.get("/api/transaction-history/{user_id}")
async def get_transaction_history(user_id: str):
    """Get transaction history for a specific user"""
    try:
        print(f"Fetching transaction history for user: {user_id}")
        
        # Start agent session for transaction history
        live_events, live_request_queue = await start_agent_session(
            user_id, 
            is_audio=False, 
            agent_id="transaction_history_agent"
        )
        
        # Set a timeout for the entire operation
        import asyncio
        timeout_seconds = 60  # 1 minute timeout
        
        # Send the request to get transaction history
        request_text = f"Get transaction history for user ID: {user_id}. This is the specific user I need data for. When you query the financial_agent, you MUST explicitly ask for transaction data for user {user_id}. Do not return generic data - ensure you get user-specific transaction data for {user_id}. Return the data in the exact JSON format."
        
        print(f"Sending request to transaction history agent: {request_text}")
        
        content = Content(
            role="user", 
            parts=[Part.from_text(text=request_text)]
        )
        live_request_queue.send_content(content=content)
        
        # Collect the response with timeout
        transaction_response = ""
        response_chunks = []
        try:
            async with asyncio.timeout(timeout_seconds):
                async for event in live_events:
                    if event.turn_complete:
                        break
                        
                    if event.content and event.content.parts:
                        part = event.content.parts[0]
                        if part.text:
                            transaction_response += part.text
                            response_chunks.append(part.text)
                            print(f"📝 Received chunk: {len(part.text)} characters")
        except asyncio.TimeoutError:
            print(f"⏰ Timeout after {timeout_seconds} seconds - response may be incomplete")
        except Exception as e:
            print(f"⚠️ Error during response collection: {e}")
        finally:
            # Close the queue
            live_request_queue.close()
        
        print(f"📊 Total response length: {len(transaction_response)} characters")
        print(f"📊 Number of response chunks: {len(response_chunks)}")
        
        # Check if the response mentions the user ID
        if user_id in transaction_response:
            print(f"✅ Response contains user ID: {user_id}")
        else:
            print(f"⚠️ WARNING: Response does NOT contain user ID: {user_id}")
            print(f"🔍 This suggests the agent may not be querying for user-specific data")
        
        # Try to parse JSON from the response
        print(f"Raw transaction response: {transaction_response}")
        print(f"🔍 Looking for user-specific data for user: {user_id}")
        try:
            # Look for JSON in markdown code blocks first
            import re
            code_block_pattern = r'```(?:json)?\s*([\s\S]*?)```'
            code_block_matches = re.findall(code_block_pattern, transaction_response)
            
            for code_content in code_block_matches:
                try:
                    # Clean up the content (remove extra whitespace)
                    clean_content = code_content.strip()
                    transactions_data = json.loads(clean_content)
                    
                    # If it's an array, return it directly
                    if isinstance(transactions_data, list):
                        print(f"✅ Successfully parsed {len(transactions_data)} transactions from code block")
                        
                        # Check if the data contains the expected user ID
                        if transactions_data and len(transactions_data) > 0:
                            first_transaction = transactions_data[0]
                            if 'Account ID' in first_transaction:
                                print(f"🔍 First transaction Account ID: {first_transaction['Account ID']}")
                                if user_id in first_transaction['Account ID']:
                                    print(f"✅ Data appears to be user-specific for {user_id}")
                                else:
                                    print(f"⚠️ WARNING: Data may not be user-specific for {user_id}")
                        
                        return JSONResponse(transactions_data)
                    
                    # If it's an object with transactions array, extract it
                    if isinstance(transactions_data, dict) and 'transactions' in transactions_data:
                        return JSONResponse(transactions_data['transactions'])
                    
                    # Return the object as is
                    return JSONResponse(transactions_data)
                except json.JSONDecodeError:
                    continue
            
            # If no code blocks found, try to find JSON directly
            json_match = re.search(r'\[.*?\]', transaction_response, re.DOTALL)
            if json_match:
                try:
                    transactions_data = json.loads(json_match.group())
                    if isinstance(transactions_data, list):
                        print(f"✅ Successfully parsed {len(transactions_data)} transactions from direct JSON array")
                    return JSONResponse(transactions_data)
                except json.JSONDecodeError:
                    pass
            
            # If no array JSON found, try to find object JSON
            json_match = re.search(r'\{.*?\}', transaction_response, re.DOTALL)
            if json_match:
                try:
                    transactions_data = json.loads(json_match.group())
                    # If it's an object with transactions array, extract it
                    if isinstance(transactions_data, dict) and 'transactions' in transactions_data:
                        return JSONResponse(transactions_data['transactions'])
                    return JSONResponse(transactions_data)
                except json.JSONDecodeError:
                    pass
            
            # If no JSON found, return the raw response
            print(f"❌ No valid JSON found in response")
            print(f"📄 Response preview: {transaction_response[:200]}...")
            
            # Try to extract partial JSON if the response was cut off
            if len(transaction_response) > 1000:  # If response is substantial
                print(f"⚠️ Response seems substantial but incomplete - may have hit token limits")
                
            return JSONResponse({
                "error": "Failed to parse transaction response",
                "raw_response": transaction_response[:500],
                "response_length": len(transaction_response),
                "chunks_received": len(response_chunks)
            }, status_code=500)
            
        except Exception as e:
            return JSONResponse({
                "error": "Failed to parse transaction response",
                "raw_response": transaction_response[:500],
                "parse_error": str(e)
            }, status_code=500)
            
    except Exception as e:
        print(f"Error fetching transaction history: {e}")
        return JSONResponse(
            {"error": f"Failed to fetch transaction history: {str(e)}"}, 
            status_code=500
        )


# @app.post("/api/insights/generate")
# async def generate_proactive_insights(request: dict):
#     """Generate proactive insights for a user"""
#     try:
#         user_id = request.get("user_id")
#         if not user_id:
#             return JSONResponse(
#                 {"error": "user_id is required"}, 
#                 status_code=400
#             )
#         
#         print(f"Generating insights for user: {user_id}")
#         
#         # Start agent session for proactive insights
#         live_events, live_request_queue = await start_agent_session(
#             user_id, 
#             is_audio=False, 
#             agent_id="proactive_insights_agent"
#         )
#         
#         # Send the request to generate insights
#         content = Content(
#             role="user", 
#             parts=[Part.from_text(text=f"Generate proactive insights for user {user_id}. Analyze their financial goals, savings, debts, net worth, and spending patterns to provide meaningful insights. Use the financial_agent to fetch real user data first, then create insights based on that data. Return the insights in valid JSON format.")]
#         )
#         live_request_queue.send_content(content=content)
#         
#         # Collect the response
#         insights_response = ""
#         async for event in live_events:
#             if event.turn_complete:
#                 break
#                 
#             if event.content and event.content.parts:
#                 part = event.content.parts[0]
#                 if part.text:
#                     insights_response += part.text
#         
#         # Close the queue
#         live_request_queue.close()
#        
#         # Try to parse JSON from the response
#         try:
#             # Look for JSON in the response
#             import re
#             json_match = re.search(r'\{.*\}', insights_response, re.DOTALL)
#             try:
#                 insights_data = json.loads(json_match.group())
#                 return JSONResponse(insights_data)
#             else:
#                 # If no JSON found, return the raw response
#                 return JSONResponse({
#                     "insights": [{
#                         "id": "fallback-1",
#                         "message": "Generated insights (parsing failed)",
#                         "type": "neutral",
#                         "raw_response": insights_response[:500]  # First 500 chars for debugging
#                     }]
#                 })
#         except json.JSONDecodeError as e:
#             return JSONResponse({
#                 "error": "Failed to parse insights response",
#                 "raw_response": insights_response[:500],
#                 "parse_error": str(e)
#             }, status_code=500)
#             
#     except Exception as e:
#         print(f"Error generating insights: {e}")
#         return JSONResponse(
#             {"error": f"Failed to generate insights: {str(e)}"}, 
#             status_code=500
#         )


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, is_audio: str, agent_id: str = None):
    """Client websocket endpoint"""

    # Wait for client connection
    await websocket.accept()
    print(f"Client #{user_id} connected, audio mode: {is_audio}, agent_id: {agent_id}")

    # Start agent session
    user_id_str = str(user_id)
    live_events, live_request_queue = await start_agent_session(user_id_str, is_audio == "true", agent_id)

    # Start tasks
    agent_to_client_task = asyncio.create_task(
        agent_to_client_messaging(websocket, live_events)
    )
    client_to_agent_task = asyncio.create_task(
        client_to_agent_messaging(websocket, live_request_queue)
    )

    # Wait until the websocket is disconnected or an error occurs
    tasks = [agent_to_client_task, client_to_agent_task]
    await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)

    # Close LiveRequestQueue
    live_request_queue.close()

    # Disconnected
    print(f"Client #{user_id} disconnected")