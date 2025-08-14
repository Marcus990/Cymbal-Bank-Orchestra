from google.adk.agents import Agent

# from google.adk.tools import google_search  # Import the search tool

"""
Utility functions for Google Calendar integration.
"""

import json
import os
import datetime
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Define the scopes for Google Calendar API
SCOPES = ["https.googleapis.com/auth/calendar"]

# Path for token storage
TOKEN_PATH = Path(os.path.expanduser("~/.credentials/calendar_token.json"))
CREDENTIALS_PATH = Path(__file__).parent / "credentials.json"


def get_calendar_service():
    """
    Authenticate and create a Google Calendar service object.

    Returns:
        A Google Calendar service object or None if authentication fails
    """
    creds = None

    # Check if token exists and is valid
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_info(
            json.loads(TOKEN_PATH.read_text()), SCOPES
        )

    # If credentials don't exist or are invalid, refresh or get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # If credentials.json doesn't exist, we can't proceed with OAuth flow
            if not CREDENTIALS_PATH.exists():
                print(
                    f"Error: {CREDENTIALS_PATH} not found. Please follow setup instructions."
                )
                return None

            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
        TOKEN_PATH.write_text(creds.to_json())

    # Create and return the Calendar service
    return build("calendar", "v3", credentials=creds)


def format_event_time(event_time):
    """
    Format an event time into a human-readable string.

    Args:
        event_time (dict): The event time dictionary from Google Calendar API

    Returns:
        str: A human-readable time string
    """
    if "dateTime" in event_time:
        # This is a datetime event
        dt = datetime.datetime.fromisoformat(event_time["dateTime"].replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %I:%M %p")
    elif "date" in event_time:
        # This is an all-day event
        return f"{event_time['date']} (All day)"
    return "Unknown time format"


def parse_datetime(datetime_str):
    """
    Parse a datetime string into a datetime object.

    Args:
        datetime_str (str): A string representing a date and time

    Returns:
        datetime: A datetime object or None if parsing fails
    """
    formats = [
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %I:%M %p",
        "%Y-%m-%d",
        "%m/%d/%Y %H:%M",
        "%m/%d/%Y %I:%M %p",
        "%m/%d/%Y",
        "%B %d, %Y %H:%M",
        "%B %d, %Y %I:%M %p",
        "%B %d, %Y",
    ]

    for fmt in formats:
        try:
            return datetime.datetime.strptime(datetime_str, fmt)
        except ValueError:
            continue

    return None


def get_current_time() -> dict:
    """
    Get the current time and date
    """
    now = datetime.datetime.now()

    # Format date as MM-DD-YYYY
    formatted_date = now.strftime("%m-%d-%Y")

    return {
        "current_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "formatted_date": formatted_date,
    }

"""
Create event tool for Google Calendar integration.
"""


def create_event(
    summary: str,
    start_time: str,
    end_time: str,
) -> dict:
    """
    Create a new event in Google Calendar.

    Args:
        summary (str): Event title/summary
        start_time (str): Start time (e.g., "2023-12-31 14:00")
        end_time (str): End time (e.g., "2023-12-31 15:00")

    Returns:
        dict: Information about the created event or error details
    """
    try:
        # Get calendar service
        service = get_calendar_service()
        if not service:
            return {
                "status": "error",
                "message": "Failed to authenticate with Google Calendar. Please check credentials.",
            }

        # Always use primary calendar
        calendar_id = "primary"

        # Parse times
        start_dt = parse_datetime(start_time)
        end_dt = parse_datetime(end_time)

        if not start_dt or not end_dt:
            return {
                "status": "error",
                "message": "Invalid date/time format. Please use YYYY-MM-DD HH:MM format.",
            }

        # Dynamically determine timezone
        timezone_id = "America/New_York"  # Default to Eastern Time

        try:
            # Try to get the timezone from the calendar settings
            settings = service.settings().list().execute()
            for setting in settings.get("items", []):
                if setting.get("id") == "timezone":
                    timezone_id = setting.get("value")
                    break
        except Exception:
            # If we can't get it from settings, we'll use the default
            pass

        # Create event body without type annotations
        event_body = {}

        # Add summary
        event_body["summary"] = summary

        # Add start and end times with the dynamically determined timezone
        event_body["start"] = {
            "dateTime": start_dt.isoformat(),
            "timeZone": timezone_id,
        }
        event_body["end"] = {"dateTime": end_dt.isoformat(), "timeZone": timezone_id}

        # Call the Calendar API to create the event
        event = (
            service.events().insert(calendarId=calendar_id, body=event_body).execute()
        )

        return {
            "status": "success",
            "message": "Event created successfully",
            "event_id": event["id"],
            "event_link": event.get("htmlLink", ""),
        }

    except Exception as e:
        return {"status": "error", "message": f"Error creating event: {str(e)}"}

"""
Delete event tool for Google Calendar integration.
"""


def delete_event(
    event_id: str,
    confirm: bool,
) -> dict:
    """
    Delete an event from Google Calendar.

    Args:
        event_id (str): The unique ID of the event to delete
        confirm (bool): Confirmation flag (must be set to True to delete)

    Returns:
        dict: Operation status and details
    """
    # Safety check - require explicit confirmation
    if not confirm:
        return {
            "status": "error",
            "message": "Please confirm deletion by setting confirm=True",
        }

    try:
        # Get calendar service
        service = get_calendar_service()
        if not service:
            return {
                "status": "error",
                "message": "Failed to authenticate with Google Calendar. Please check credentials.",
            }

        # Always use primary calendar
        calendar_id = "primary"

        # Call the Calendar API to delete the event
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()

        return {
            "status": "success",
            "message": f"Event {event_id} has been deleted successfully",
            "event_id": event_id,
        }

    except Exception as e:
        return {"status": "error", "message": f"Error deleting event: {str(e)}"}

"""
Edit event tool for Google Calendar integration.
"""


def edit_event(
    event_id: str,
    summary: str,
    start_time: str,
    end_time: str,
) -> dict:
    """
    Edit an existing event in Google Calendar - change title and/or reschedule.

    Args:
        event_id (str): The ID of the event to edit
        summary (str): New title/summary for the event (pass empty string to keep unchanged)
        start_time (str): New start time (e.g., "2023-12-31 14:00", pass empty string to keep unchanged)
        end_time (str): New end time (e.g., "2023-12-31 15:00", pass empty string to keep unchanged)

    Returns:
        dict: Information about the edited event or error details
    """
    try:
        # Get calendar service
        service = get_calendar_service()
        if not service:
            return {
                "status": "error",
                "message": "Failed to authenticate with Google Calendar. Please check credentials.",
            }

        # Always use primary calendar
        calendar_id = "primary"

        # First get the existing event
        try:
            event = (
                service.events().get(calendarId=calendar_id, eventId=event_id).execute()
            )
        except Exception:
            return {
                "status": "error",
                "message": f"Event with ID {event_id} not found in primary calendar.",
            }

        # Update the event with new values
        if summary:
            event["summary"] = summary

        # Get timezone from the original event
        timezone_id = "America/New_York"  # Default
        if "start" in event and "timeZone" in event["start"]:
            timezone_id = event["start"]["timeZone"]

        # Update start time if provided
        if start_time:
            start_dt = parse_datetime(start_time)
            if not start_dt:
                return {
                    "status": "error",
                    "message": "Invalid start time format. Please use YYYY-MM-DD HH:MM format.",
                }
            event["start"] = {"dateTime": start_dt.isoformat(), "timeZone": timezone_id}

        # Update end time if provided
        if end_time:
            end_dt = parse_datetime(end_time)
            if not end_dt:
                return {
                    "status": "error",
                    "message": "Invalid end time format. Please use YYYY-MM-DD HH:MM format.",
                }
            event["end"] = {"dateTime": end_dt.isoformat(), "timeZone": timezone_id}

        # Update the event
        updated_event = (
            service.events()
            .update(calendarId=calendar_id, eventId=event_id, body=event)
            .execute()
        )

        return {
            "status": "success",
            "message": "Event updated successfully",
            "event_id": updated_event["id"],
            "event_link": updated_event.get("htmlLink", ""),
        }

    except Exception as e:
        return {"status": "error", "message": f"Error updating event: {str(e)}"}

"""
List events tool for Google Calendar integration.
"""


def list_events(
    start_date: str,
    days: int,
) -> dict:
    """
    List upcoming calendar events within a specified date range.

    Args:
        start_date (str): Start date in YYYY-MM-DD format. If empty string, defaults to today.
        days (int): Number of days to look ahead. Use 1 for today only, 7 for a week, 30 for a month, etc.

    Returns:
        dict: Information about upcoming events or error details
    """
    try:
        print("Listing events")
        print("Start date: ", start_date)
        print("Days: ", days)
        # Get calendar service
        service = get_calendar_service()
        if not service:
            return {
                "status": "error",
                "message": "Failed to authenticate with Google Calendar. Please check credentials.",
                "events": [],
            }

        # Always use a large max_results value to return all events
        max_results = 100

        # Always use primary calendar
        calendar_id = "primary"

        # Set time range
        if not start_date or start_date.strip() == "":
            start_time = datetime.datetime.utcnow()
        else:
            try:
                start_time = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            except ValueError:
                return {
                    "status": "error",
                    "message": f"Invalid date format: {start_date}. Use YYYY-MM-DD format.",
                    "events": [],
                }

        # If days is not provided or is invalid, default to 1 day
        if not days or days < 1:
            days = 1

        end_time = start_time + datetime.timedelta(days=days)

        # Format times for API call
        time_min = start_time.isoformat() + "Z"
        time_max = end_time.isoformat() + "Z"

        # Call the Calendar API
        events_result = (
            service.events()
            .list(
                calendarId=calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        events = events_result.get("items", [])

        if not events:
            return {
                "status": "success",
                "message": "No upcoming events found.",
                "events": [],
            }

        # Format events for display
        formatted_events = []
        for event in events:
            formatted_event = {
                "id": event.get("id"),
                "summary": event.get("summary", "Untitled Event"),
                "start": format_event_time(event.get("start", {})),
                "end": format_event_time(event.get("end", {})),
                "location": event.get("location", ""),
                "description": event.get("description", ""),
                "attendees": [
                    attendee.get("email")
                    for attendee in event.get("attendees", [])
                    if "email" in attendee
                ],
                "link": event.get("htmlLink", ""),
            }
            formatted_events.append(formatted_event)

        return {
            "status": "success",
            "message": f"Found {len(formatted_events)} event(s).",
            "events": formatted_events,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Error fetching events: {str(e)}",
            "events": [],
        }

calendar_agent = Agent(
    # A unique name for the agent.
    name="jarvis",
    model="gemini-2.0-flash-exp",
    description="Agent to help with scheduling and calendar operations.",
    instruction=f"""
    You are Jarvis, a helpful assistant that can perform various tasks 
    helping with scheduling and calendar operations.
    
    ## Calendar operations
    You can perform calendar operations directly using these tools:
    - `list_events`: Show events from your calendar for a specific time period
    - `create_event`: Add a new event to your calendar 
    - `edit_event`: Edit an existing event (change title or reschedule)
    - `delete_event`: Remove an event from your calendar
    - `find_free_time`: Find available free time slots in your calendar
    
    ## Be proactive and conversational
    Be proactive when handling calendar requests. Don't ask unnecessary questions when the context or defaults make sense.
    
    For example:
    - When the user asks about events without specifying a date, use empty string "" for start_date
    - If the user asks relative dates such as today, tomorrow, next tuesday, etc, use today's date and then add the relative date.
    
    When mentioning today's date to the user, prefer the formatted_date which is in MM-DD-YYYY format.
    
    ## Event listing guidelines
    For listing events:
    - If no date is mentioned, use today's date for start_date, which will default to today
    - If a specific date is mentioned, format it as YYYY-MM-DD
    - Always pass "primary" as the calendar_id
    - Always pass 100 for max_results (the function internally handles this)
    - For days, use 1 for today only, 7 for a week, 30 for a month, etc.
    
    ## Creating events guidelines
    For creating events:
    - For the summary, use a concise title that describes the event
    - For start_time and end_time, format as "YYYY-MM-DD HH:MM"
    - The local timezone is automatically added to events
    - Always use "primary" as the calendar_id
    
    ## Editing events guidelines
    For editing events:
    - You need the event_id, which you get from list_events results
    - All parameters are required, but you can use empty strings for fields you don't want to change
    - Use empty string "" for summary, start_time, or end_time to keep those values unchanged
    - If changing the event time, specify both start_time and end_time (or both as empty strings to keep unchanged)

    Important:
    - Be super concise in your responses and only return the information requested (not extra information).
    - NEVER show the raw response from a tool_outputs. Instead, use the information to answer the question.
    - NEVER show ```tool_outputs...``` in your response.

    Today's date is {get_current_time()}.
    """,
    tools=[
        list_events,
        create_event,
        edit_event,
        delete_event,
    ],
)