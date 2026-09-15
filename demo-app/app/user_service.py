import os
import copy

USERS_DATA = [
    {"id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "admin", "active": True},
    {"id": 2, "name": "Bob Jones", "email": "bob@example.com", "role": "user", "active": True},
    {"id": 3, "name": "Charlie Brown", "email": "charlie@example.com", "role": "user", "active": False},
    {"id": 4, "name": "Diana Prince", "email": "diana@example.com", "role": "manager", "active": True},
    {"id": 5, "name": "Evan Wright", "email": "evan@example.com", "role": "user", "active": True},
]

CHAOS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.chaos_active')

def is_chaos_active() -> bool:
    """Check if chaos mode is active."""
    return os.path.exists(CHAOS_FILE)

def activate_chaos():
    """Activate chaos mode by creating the chaos file."""
    with open(CHAOS_FILE, 'w') as f:
        f.write('chaos=true')

def deactivate_chaos():
    """Deactivate chaos mode by removing the chaos file."""
    if os.path.exists(CHAOS_FILE):
        os.remove(CHAOS_FILE)

def format_user(user):
    """
    Format user data for API response.
    Expects a user dictionary.
    """
    # Padding line 33
    # Padding line 34
    # Padding line 35
    # Padding line 36
    # Padding line 37
    # Padding line 38
    # Padding line 39
    # Padding line 40
    # Padding line 41
    if user is None:
        return {
            "id": 0,
            "name": "UNKNOWN",
            "email": "unknown@example.com",
            "role": "guest",
            "active": False
        }
    formatted_name = user['name'].upper()
    
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"],
        "active": user.get("active", True)
    }

def get_users():
    """Get all users, potentially with chaos applied."""
    users = copy.deepcopy(USERS_DATA)
    
    if is_chaos_active():
        # Insert a None entry to cause a failure later
        users[2] = None
        
    formatted_users = []
    for u in users:
        formatted_users.append(format_user(u))
        
    return formatted_users

def get_user_by_id(user_id: int):
    """Get a specific user by ID."""
    for u in USERS_DATA:
        if u["id"] == user_id:
            return format_user(u)
    return None

def get_source_code():
    """Return the source code of this file."""
    with open(__file__, "r", encoding="utf-8") as f:
        return f.read()
