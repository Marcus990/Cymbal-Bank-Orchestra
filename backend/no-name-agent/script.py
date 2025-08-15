import os.path
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar"]

TOKEN_PATH = Path(os.path.expanduser("~/.credentials/calendar_token.json"))
CREDENTIALS_PATH = Path(__file__).parent / "credentials.json"


def main():
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        except ValueError as e:
            print(f"Error reading credentials: {e}")
            print("Deleting invalid token file and re-authenticating...")
            TOKEN_PATH.unlink(missing_ok=True)
            creds = None
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH), SCOPES
            )
            # Request offline access to get refresh token
            flow.redirect_uri = "http://localhost:8080"
            creds = flow.run_local_server(port=8080, access_type='offline', prompt='consent')
        
        # Save the credentials for the next run
        TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())

    service = build("calendar", "v3", credentials=creds)

    # Call the Calendar API
    # ... (your code to interact with the Calendar API)

if __name__ == "__main__":
    main()