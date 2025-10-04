import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyAzUtPGd56rc8Y_sL9DoKsWDD-Bqds0IgU"
genai.configure(api_key=GEMINI_API_KEY)

def get_advice(user_data, weather_data, calendar_events, tasks_list):
    prompt = f"""
    User Profile: {user_data}
    Current Weather: {weather_data}
    Calendar Events: {calendar_events}
    Tasks: {tasks_list}
    
    Provide personalized weather advice considering user's health conditions and schedule.
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content(prompt)
    return response.text
