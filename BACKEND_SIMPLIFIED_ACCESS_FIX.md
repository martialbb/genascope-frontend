# Backend Fix: Restrict Simplified Access Token Permissions

## Problem Statement

Patients who authenticate via simplified access (invite link) receive a JWT token with `access_type: 'simplified'`. Currently, the backend does not restrict what API endpoints these tokens can access. This means a patient with simplified access could potentially:

1. Call `/api/patients/` and list all patients
2. Call `/api/users/` and see user information
3. Call `/api/accounts/` and access account data
4. Access any other administrative endpoint

## Current Simplified Access Token Structure

The simplified access endpoint (`/simplified_access`) creates a JWT with these fields:
- `access_type: 'simplified'`
- `id` or `patient_id`: The patient's ID
- `invite_id`: The invite that was used
- `chat_strategy_id`: The chat strategy from the invite
- `exp`: Expiration (typically 4 hours)

## Required Backend Changes

### 1. Create a Dependency for Simplified Access Check

Create a new dependency function that can be used to restrict endpoints:

```python
# app/dependencies/auth.py

from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user

def require_full_access(current_user = Depends(get_current_user)):
    """
    Dependency that blocks simplified access tokens.
    Use this on endpoints that should NOT be accessible to patients via invite links.
    """
    if hasattr(current_user, 'access_type') and current_user.access_type == 'simplified':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is not accessible with simplified access. Please log in with full credentials."
        )
    return current_user

def require_simplified_or_full_access(current_user = Depends(get_current_user)):
    """
    Dependency that allows both simplified and full access tokens.
    Use this on endpoints that SHOULD be accessible to patients via invite links (e.g., chat endpoints).
    """
    return current_user
```

### 2. Define Allowed Endpoints for Simplified Access

Simplified access patients should ONLY be able to access:

**Allowed Endpoints:**
- `POST /ai-chat/sessions` - Start a chat session
- `POST /ai-chat/sessions/{session_id}/messages` - Send messages
- `GET /ai-chat/sessions/{session_id}/messages` - Get messages
- `GET /ai-chat/sessions/{session_id}` - Get session details
- `POST /ai-chat/sessions/{session_id}/end` - End session
- `POST /verify_invite` - Verify their invite token
- `POST /simplified_access` - (public, no auth required)

**Blocked Endpoints (require full access):**
- `GET/POST/PUT/DELETE /api/patients/*` - Patient management
- `GET/POST/PUT/DELETE /api/users/*` - User management
- `GET/POST/PUT/DELETE /api/accounts/*` - Account management
- `GET/POST/PUT/DELETE /api/invites/*` - Invite management
- `GET/POST/PUT/DELETE /api/appointments/*` - Appointment management (admin views)
- `GET/POST /api/availability/*` - Availability management
- `GET/POST /api/lab-tests/*` - Lab test ordering
- `GET /api/clinicians` - List clinicians
- `GET/POST /api/chat-configuration/*` - Chat configuration
- `GET /api/organization/*` - Organization data

### 3. Update Endpoint Dependencies

For each protected endpoint, add the `require_full_access` dependency:

```python
# Example: app/routers/patients.py

from app.dependencies.auth import require_full_access

@router.get("/patients/", response_model=List[PatientResponse])
async def list_patients(
    current_user = Depends(require_full_access),  # Changed from get_current_user
    db: Session = Depends(get_db)
):
    # ... existing implementation
```

For chat endpoints that should allow simplified access:

```python
# Example: app/routers/ai_chat.py

from app.dependencies.auth import require_simplified_or_full_access

@router.post("/ai-chat/sessions")
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user = Depends(require_simplified_or_full_access),  # Allows simplified access
    db: Session = Depends(get_db)
):
    # ... existing implementation
```

### 4. Add Middleware Alternative (Optional)

If you prefer a centralized approach, create middleware:

```python
# app/middleware/simplified_access.py

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

# Endpoints that simplified access tokens CAN access
SIMPLIFIED_ACCESS_ALLOWED_PATHS = [
    "/ai-chat/sessions",
    "/ai-chat/sessions/",
    "/verify_invite",
    "/simplified_access",
    "/docs",  # OpenAPI docs
    "/openapi.json",
    "/health",
]

def is_path_allowed_for_simplified(path: str) -> bool:
    """Check if path is allowed for simplified access."""
    # Allow exact matches
    if path in SIMPLIFIED_ACCESS_ALLOWED_PATHS:
        return True
    
    # Allow AI chat session paths (with session IDs)
    if path.startswith("/ai-chat/sessions/"):
        return True
    
    return False

class SimplifiedAccessMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            try:
                # Decode token to check access_type
                payload = decode_token(token)  # Use your token decoding function
                
                if payload.get("access_type") == "simplified":
                    # Check if path is allowed
                    if not is_path_allowed_for_simplified(request.url.path):
                        raise HTTPException(
                            status_code=403,
                            detail="This endpoint is not accessible with simplified access"
                        )
            except Exception:
                pass  # Let the endpoint handle invalid tokens
        
        return await call_next(request)
```

### 5. Token Validation Updates

Ensure the simplified access token creation includes the `access_type` field:

```python
# app/routers/auth.py or app/core/security.py

def create_simplified_access_token(patient_id: str, invite_id: str, chat_strategy_id: str) -> str:
    """Create a JWT token for simplified patient access."""
    expires_delta = timedelta(hours=4)  # 4-hour session
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "access_type": "simplified",  # CRITICAL: This field identifies simplified access
        "sub": str(patient_id),
        "id": str(patient_id),
        "patient_id": str(patient_id),
        "invite_id": invite_id,
        "chat_strategy_id": chat_strategy_id,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

### 6. Testing Checklist

After implementing the changes, verify:

- [ ] Simplified access patient can start a chat session
- [ ] Simplified access patient can send/receive messages
- [ ] Simplified access patient gets 403 when trying to access `/api/patients/`
- [ ] Simplified access patient gets 403 when trying to access `/api/users/`
- [ ] Simplified access patient gets 403 when trying to access `/api/accounts/`
- [ ] Simplified access patient gets 403 when trying to access `/api/invites/`
- [ ] Regular authenticated users can still access all endpoints
- [ ] Token expiration still works correctly

### 7. Error Response Format

Return consistent error responses for blocked requests:

```json
{
  "detail": "This endpoint is not accessible with simplified access. Please log in with full credentials.",
  "error_code": "SIMPLIFIED_ACCESS_RESTRICTED"
}
```

## Implementation Priority

1. **High Priority**: Add `require_full_access` dependency to patient, user, and account endpoints
2. **High Priority**: Ensure AI chat endpoints use `require_simplified_or_full_access`
3. **Medium Priority**: Add dependency to invite, appointment, and other sensitive endpoints
4. **Low Priority**: Add middleware for centralized path-based blocking

## Security Note

This is a defense-in-depth measure. Even though the frontend now blocks simplified access users from navigating to protected pages, the backend must enforce these restrictions as well. Users can:
- Manually modify localStorage
- Use browser developer tools to make API calls
- Use curl/Postman to call APIs directly

Backend enforcement is essential for proper security.

